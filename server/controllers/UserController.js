import { Webhook } from "svix"
import userModel from "../models/userModel.js"
import razorpay from 'razorpay'

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
const paymentRazorpay = async (req,res) => {
    try {

        const { clerkId, planId } = req.body

        const userData = await userModel.findOne({ clerkId })

        if (!userData || !planId) {
            return res.json({ success:false,message:'Invalid Credentials'})
        }

        let credits , plan , amount , date

        switch (planId) {
            case 'Free':
                plan = 'Free'
                credits = 10
                amount = 0
                break;

            case 'Basic':
                plan = 'Basic'
                credits = 100
                amount = 10
                break;

                case 'Advanced':
                plan = 'Advanced'
                credits = 500
                amount = 10
                break;

                case 'Basic':
                plan = 'Basic'
                credits = 100
                amount = 10
                break;
        
            default:
                break;
        }
        
    } catch (error) {
       console.log(error.message);
        res.json({ success: false, message: error.message})
    }
}


export { clerkWebhooks, userCredits }