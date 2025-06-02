import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Just call config() without params to use CLOUDINARY_URL
cloudinary.config();

export default cloudinary;