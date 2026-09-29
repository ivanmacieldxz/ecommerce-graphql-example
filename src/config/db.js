import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('La variable MONGODB_URI no está definida en las variables de entorno.');
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`✅ MongoDB conectado exitosamente: ${conn.connection.host} | Base de datos: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB Atlas:', error.message);
    if (error.message.includes('whitelisted') || error.message.includes('Could not connect') || error.name === 'MongooseServerSelectionError') {
      console.error('👉 RECUERDA: En MongoDB Atlas -> Network Access -> agrega la IP "0.0.0.0/0" (Allow Access from Anywhere) para permitir el acceso desde Render y tu máquina local.');
    }
    throw error;
  }
};
