import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusreport';

mongoose.connect(mongoUri, {
    // useNewUrlParser and useUnifiedTopology are default in newer mongoose versions
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err);
});

export default mongoose;
