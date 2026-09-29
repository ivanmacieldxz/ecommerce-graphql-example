import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { Product } from '../models/Product.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Laptop Gamer ASUS ROG Strix G16',
    price: 1499.99,
    stock: 12,
    category: 'Computación',
    description: 'Laptop para juegos con procesador Intel Core i7, 16GB RAM, 1TB SSD y GPU RTX 4060.',
  },
  {
    name: 'Teclado Mecánico Inalámbrico Keychron K2',
    price: 99.5,
    stock: 25,
    category: 'Accesorios',
    description: 'Teclado mecánico compacto al 75% con switches Gateron Brown y retroiluminación RGB.',
  },
  {
    name: 'Mouse Ergonómico Logitech MX Master 3S',
    price: 119.99,
    stock: 18,
    category: 'Accesorios',
    description: 'Mouse inalámbrico de alta precisión con sensor de 8000 DPI y clics silenciosos.',
  },
  {
    name: 'Monitor LG UltraGear 27" 144Hz 1ms',
    price: 289.0,
    stock: 8,
    category: 'Monitores',
    description: 'Monitor para gaming IPS FHD compatible con NVIDIA G-Sync y AMD FreeSync Premium.',
  },
  {
    name: 'Auriculares Sony WH-1000XM5',
    price: 349.99,
    stock: 15,
    category: 'Audio',
    description: 'Auriculares inalámbricos con cancelación activa de ruido líder en la industria.',
  },
  {
    name: 'Smartphone Samsung Galaxy S24 Ultra',
    price: 1299.0,
    stock: 0,
    category: 'Smartphones',
    description: 'Smartphone insignia con pantalla Dynamic AMOLED 2X, cámara de 200MP y S-Pen integrado.',
  },
  {
    name: 'Micrófono USB Blue Yeti',
    price: 129.95,
    stock: 10,
    category: 'Audio',
    description: 'Micrófono de condensador USB profesional para podcasting, streaming y grabación.',
  },
];

const runSeed = async () => {
  try {
    console.log('🔄 Conectando a la base de datos para poblar datos...');
    await connectDB();

    console.log('🧹 Limpiando productos existentes...');
    await Product.deleteMany({});

    console.log('📦 Insertando productos de prueba...');
    const inserted = await Product.insertMany(sampleProducts);

    console.log(`✅ ¡Éxito! Se insertaron ${inserted.length} productos en MongoDB Atlas.`);
    inserted.forEach((prod) => {
      console.log(`   - [${prod.category}] ${prod.name} ($${prod.price}) - Stock: ${prod.stock}`);
    });

    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
};

runSeed();
