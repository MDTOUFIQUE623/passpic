import { Webhook } from 'svix'
import userModel from '../models/userModel.js'

export const handleClerkWebhook = async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env')
    }

    // Get the headers
    const svix_id = req.headers["svix-id"]
    const svix_timestamp = req.headers["svix-timestamp"]
    const svix_signature = req.headers["svix-signature"]

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: 'Error occured -- no svix headers' })
    }

    // Get the body
    const payload = req.body
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET)

    let evt

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        })
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return res.status(400).json({ error: 'Error occured -- invalid signature' })
    }

    // Handle the webhook
    const eventType = evt.type

    try {
        switch (eventType) {
            case 'user.created':
            case 'user.updated': {
                const { id, email_addresses, image_url, first_name, last_name } = evt.data

                const user = await userModel.findOneAndUpdate(
                    { clerkId: id },
                    {
                        clerkId: id,
                        email: email_addresses[0].email_address,
                        photo: image_url,
                        firstName: first_name,
                        lastName: last_name
                    },
                    { upsert: true, new: true }
                )
                
                console.log(`User ${eventType === 'user.created' ? 'created' : 'updated'}:`, user)
                return res.status(200).json(user)
            }

            case 'user.deleted': {
                const { id } = evt.data
                
                const deletedUser = await userModel.findOneAndDelete({ clerkId: id })
                
                if (!deletedUser) {
                    console.log('User not found in database:', id)
                    return res.status(404).json({ message: 'User not found' })
                }

                console.log('User deleted:', deletedUser)
                return res.status(200).json({ 
                    message: 'User successfully deleted',
                    user: deletedUser 
                })
            }

            default:
                console.log('Unhandled webhook event type:', eventType)
                return res.status(200).json({ 
                    message: `Webhook received: ${eventType}`,
                    status: 'unhandled' 
                })
        }
    } catch (error) {
        console.error(`Error processing ${eventType} webhook:`, error)
        return res.status(500).json({ 
            error: `Error processing ${eventType} webhook`,
            details: error.message 
        })
    }
} 