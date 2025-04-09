import express from 'express';
// import routes from './routes/aggregation.js';
import routes from './routes/index.js';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import protectedRoutes from './routes/protected.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000; 

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

//Routes 
app.use('/api', routes);
app.use('/api', authRoutes);
app.use('/api', protectedRoutes);

//Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 