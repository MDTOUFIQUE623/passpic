import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupProject() {
    try {
        // Create necessary directories
        const dirs = [
            'uploads',
            'models',
            'models/u2net',
            'logs'
        ];

        for (const dir of dirs) {
            await fs.mkdir(path.join(__dirname, '..', dir), { recursive: true });
            console.log(`Created directory: ${dir}`);
        }

        // Create .env file if it doesn't exist
        const envPath = path.join(__dirname, '..', '.env');
        try {
            await fs.access(envPath);
        } catch {
            const envTemplate = `
MONGODB_URI=your_mongodb_uri
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
NODE_ENV=development
            `.trim();
            
            await fs.writeFile(envPath, envTemplate);
            console.log('Created .env template');
        }

        console.log('Project setup completed successfully!');
    } catch (error) {
        console.error('Error during project setup:', error);
        process.exit(1);
    }
}

setupProject(); 