import { Webhook } from "svix"
import userModel from "../models/userModel.js"

// API Controller Function to Manage Clerk User with database
// http://localhost:4000/api/user/webhooks
const clerkWebhooks = async (req,res) => {

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

export {clerkWebhooks}