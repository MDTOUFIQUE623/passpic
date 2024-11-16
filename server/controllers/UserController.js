import { Webhook } from "svix"
import userModel from "../models/userModel.js"
import razorpay from 'razorpay'
import transactionModel from "../models/transactionModel.js";
import crypto from 'crypto'

// API Controller Function to Manage Clerk User with database
// http://localhost:4000/api/user/webhooks
const clerkWebhooks = async (req, res) => {

    try {

        // Verify webhook signature
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new Error('Missing Clerk Webhook Secret');
        }

        const whook = new Webhook(webhookSecret);

        const payload = JSON.stringify(req.body);
        const headers = {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        };

        // Verify the webhook
        await whook.verify(payload, headers);

        const { data, type } = req.body;

        switch (type) {
            case "user.created": {
                const userData = {
                    clerkId: data.id,
                    email: data.email_addresses[0].email_address,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url
                };

                console.log('Creating new user:', userData);
                const newUser = await userModel.create(userData);
                console.log('User created successfully:', newUser);
                return res.status(200).json({ success: true, user: newUser });
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    photo: data.image_url
                };

                console.log('Updating user:', data.id, userData);
                const updatedUser = await userModel.findOneAndUpdate(
                    { clerkId: data.id },
                    userData,
                    { new: true }
                );
                console.log('User updated successfully:', updatedUser);
                return res.status(200).json({ success: true, user: updatedUser });
            }

            case "user.deleted": {
                console.log('Deleting user:', data.id);
                const deletedUser = await userModel.findOneAndDelete({ clerkId: data.id });
                console.log('User deleted successfully:', deletedUser);
                return res.status(200).json({ success: true });
            }

            default:
                return res.status(400).json({ success: false, message: 'Unhandled webhook type' });
        }

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(400).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }

}



// API Controller function to get user available credits data
const userCredits = async (req, res) => {
    try {
        // Get clerkId from req.body (added by auth middleware)
        const { clerkId } = req.body;

        if (!clerkId) {
            return res.status(400).json({ 
                success: false, 
                message: "No user ID provided" 
            });
        }

        const userData = await userModel.findOne({ clerkId });
        
        if (!userData) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        return res.json({ 
            success: true, 
            credits: userData.creditBalance 
        });

    } catch (error) {
        console.error("Error fetching user credits:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// gateway initialize
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// API to make payment for credits
const paymentRazorpay = async (req, res) => {
    try {
        const { clerkId, planId } = req.body

        const userData = await userModel.findOne({ clerkId })

        if (!userData || !planId) {
            return res.json({ success: false, message: 'Invalid Credentials' })
        }

        let credits, plan, amount

        // Prices in USD
        switch (planId) {
            case 'Basic':
                plan = 'Basic'
                credits = 100
                amount = 10 // $10
                break;
            case 'Advanced':
                plan = 'Advanced'
                credits = 500
                amount = 50 // $50
                break;
            case 'Business':
                plan = 'Business'
                credits = 5000
                amount = 250 // $250
                break;
            default:
                return res.json({ success: false, message: 'Invalid plan selected' })
        }

        // Convert USD to INR (1 USD = ~83 INR as of now)
        // Razorpay expects amount in smallest currency unit (paise)
        const inrAmount = Math.round(amount * 83 * 100)

        // Creating Transaction
        const transactionData = await transactionModel.create({
            clerkId,
            plan,
            amount, // Store original USD amount
            credits,
            date: Date.now()
        })

        const options = {
            amount: inrAmount, // amount in paise (INR)
            currency: 'INR', // Razorpay primarily works with INR
            receipt: transactionData._id.toString()
        }

        // Create Razorpay order using Promise
        const order = await razorpayInstance.orders.create(options)
        
        // Send both INR and USD amounts to frontend
        return res.json({ 
            success: true, 
            order,
            usdAmount: amount,
            inrAmount: inrAmount/100 // Convert paise to rupees for display
        })

    } catch (error) {
        console.error('Payment creation error:', error)
        return res.json({ success: false, message: error.message })
    }
}

// API Controller function to verify razorpay payment
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
        const { clerkId } = req.body // Added from auth middleware

        // Verify the payment is legitimate
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature !== expectedSign) {
            return res.json({ success: false, message: "Invalid payment signature" });
        }

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') { // Fixed comparison operator
            const transactionData = await transactionModel.findById(orderInfo.receipt)
            
            if (!transactionData) {
                return res.json({ success: false, message: 'Transaction not found' })
            }

            if (transactionData.payment) {
                return res.json({ success: false, message: 'Payment already processed' })
            }

            // Adding Credits in user data
            const userData = await userModel.findOne({ clerkId: transactionData.clerkId })
            if (!userData) {
                return res.json({ success: false, message: 'User not found' })
            }

            const creditBalance = userData.creditBalance + transactionData.credits
            await userModel.findByIdAndUpdate(userData._id, { creditBalance })

            // Update transaction status
            await transactionModel.findByIdAndUpdate(transactionData._id, { 
                payment: true,
                razorpay_payment_id,
                razorpay_order_id,
                razorpay_signature
            })

            return res.json({ success: true, message: "Credits Added Successfully" })
        }

        return res.json({ success: false, message: "Payment not completed" })

    } catch (error) {
        console.error('Payment verification error:', error)
        return res.json({ success: false, message: error.message })
    }
}


export { clerkWebhooks, userCredits, paymentRazorpay, verifyRazorpay }