import mongoose from 'mongoose';
import { GraphQLError } from 'graphql';
import { Product } from '../models/Product.js';

export const resolvers = {
  Product: {
    id: (parent) => parent._id?.toString() || parent.id,
    createdAt: (parent) => (parent.createdAt ? new Date(parent.createdAt).toISOString() : null),
    updatedAt: (parent) => (parent.updatedAt ? new Date(parent.updatedAt).toISOString() : null),
  },

  Query: {
    products: async (_parent, { filter }) => {
      try {
        const query = {};

        if (filter) {
          // Filtrado por categoría (case-insensitive)
          if (filter.category && filter.category.trim() !== '') {
            query.category = { $regex: new RegExp(`^${filter.category.trim()}$`, 'i') };
          }

          // Filtrado por rango de precios
          if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
            query.price = {};
            if (filter.minPrice !== undefined) {
              query.price.$gte = filter.minPrice;
            }
            if (filter.maxPrice !== undefined) {
              query.price.$lte = filter.maxPrice;
            }
          }

          // Filtrado por disponibilidad en stock
          if (filter.inStock !== undefined && filter.inStock !== null) {
            if (filter.inStock) {
              query.stock = { $gt: 0 };
            } else {
              query.stock = { $eq: 0 };
            }
          }

          // Búsqueda por término en nombre o descripción
          if (filter.search && filter.search.trim() !== '') {
            const searchTerm = filter.search.trim();
            query.$or = [
              { name: { $regex: searchTerm, $options: 'i' } },
              { description: { $regex: searchTerm, $options: 'i' } },
            ];
          }
        }

        return await Product.find(query).sort({ createdAt: -1 });
      } catch (error) {
        throw new GraphQLError(`Error al obtener los productos: ${error.message}`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    product: async (_parent, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new GraphQLError(`El ID proporcionado ('${id}') no es un ObjectId válido.`, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        const product = await Product.findById(id);
        if (!product) {
          throw new GraphQLError(`Producto con ID '${id}' no encontrado.`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return product;
      } catch (error) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(`Error al buscar el producto: ${error.message}`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    categories: async () => {
      try {
        const categories = await Product.distinct('category');
        return categories.filter(Boolean).sort();
      } catch (error) {
        throw new GraphQLError(`Error al obtener las categorías: ${error.message}`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },

  Mutation: {
    createProduct: async (_parent, { input }) => {
      try {
        const newProduct = new Product(input);
        return await newProduct.save();
      } catch (error) {
        throw new GraphQLError(`Error al crear el producto: ${error.message}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    },

    updateProduct: async (_parent, { id, input }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new GraphQLError(`El ID proporcionado ('${id}') no es un ObjectId válido.`, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        // Filtrar campos undefined
        const cleanInput = Object.fromEntries(
          Object.entries(input).filter(([_, v]) => v !== undefined)
        );

        if (Object.keys(cleanInput).length === 0) {
          throw new GraphQLError('Debe proporcionar al menos un campo para actualizar.', {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          { $set: cleanInput },
          { new: true, runValidators: true }
        );

        if (!updatedProduct) {
          throw new GraphQLError(`Producto con ID '${id}' no encontrado para actualizar.`, {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return updatedProduct;
      } catch (error) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(`Error al actualizar el producto: ${error.message}`, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    },

    deleteProduct: async (_parent, { id }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new GraphQLError(`El ID proporcionado ('${id}') no es un ObjectId válido.`, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }

        const deletedProduct = await Product.findByIdAndDelete(id);
        return Boolean(deletedProduct);
      } catch (error) {
        if (error instanceof GraphQLError) throw error;
        throw new GraphQLError(`Error al eliminar el producto: ${error.message}`, {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },
};
