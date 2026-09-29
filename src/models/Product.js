import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio.'],
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'El precio del producto es obligatorio.'],
      min: [0, 'El precio no puede ser negativo.'],
    },
    stock: {
      type: Number,
      required: [true, 'El stock del producto es obligatorio.'],
      min: [0, 'El stock no puede ser negativo.'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'La categoría del producto es obligatoria.'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Índice de texto para búsquedas en nombre y descripción
productSchema.index({ name: 'text', description: 'text' });

export const Product = mongoose.model('Product', productSchema);
