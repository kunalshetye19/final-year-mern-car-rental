import mongoose from 'mongoose'

export const connectDB = async() => {
    await mongoose.connect('mongodb+srv://trifittrio333_db_user:carrental123@cluster0.o8h8hyi.mongodb.net/CarRental')
        .then(() => console.log('DB Connected'))
}