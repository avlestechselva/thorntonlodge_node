require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const existing = await User.findOne({ email: 'admin@thorntonlodgecare.com' });
        if (existing) {
            console.log('Admin user already exists.');
            process.exit(0);
        }

        const admin = new User({
            name: 'Admin',
            email: 'admin@thorntonlodgecare.com',
            password: 'Admin@1234',
            role: 'admin'
        });
        await admin.save();
        console.log('Admin user created: admin@thorntonlodgecare.com / Admin@1234');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}

seed();
