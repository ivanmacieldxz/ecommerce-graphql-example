import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../src/graphql/typeDefs.js';
import { resolvers } from '../src/graphql/resolvers.js';
import { Product } from '../src/models/Product.js';

let mongoServer;
let testServer;

describe('Pruebas de la API GraphQL (Queries, Filtros y Mutaciones)', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    testServer = new ApolloServer({
      typeDefs,
      resolvers,
    });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('1. Mutación: createProduct - Crear un nuevo producto', async () => {
    const CREATE_PRODUCT_MUTATION = `#graphql
      mutation CreateProduct($input: CreateProductInput!) {
        createProduct(input: $input) {
          id
          name
          price
          stock
          category
          description
        }
      }
    `;

    const response = await testServer.executeOperation({
      query: CREATE_PRODUCT_MUTATION,
      variables: {
        input: {
          name: 'Teclado Mecánico RGB',
          price: 89.99,
          stock: 15,
          category: 'Accesorios',
          description: 'Teclado mecánico con switches rojos e iluminación RGB.',
        },
      },
    });

    assert.strictEqual(response.body.kind, 'single');
    assert.strictEqual(response.body.singleResult.errors, undefined);
    const created = response.body.singleResult.data.createProduct;
    assert.ok(created.id);
    assert.strictEqual(created.name, 'Teclado Mecánico RGB');
    assert.strictEqual(created.price, 89.99);
    assert.strictEqual(created.stock, 15);
    assert.strictEqual(created.category, 'Accesorios');
  });

  test('2. Mutación: createProduct - Insertar productos adicionales para pruebas de filtro', async () => {
    await Product.insertMany([
      {
        name: 'Laptop Ultrabook Pro 14',
        price: 1200.0,
        stock: 5,
        category: 'Computación',
        description: 'Ultrabook ligera y potente con pantalla OLED.',
      },
      {
        name: 'Mouse Inalámbrico Ergo',
        price: 45.5,
        stock: 0,
        category: 'Accesorios',
        description: 'Mouse inalámbrico para oficina y productividad.',
      },
      {
        name: 'Monitor 4K 32 pulgadas',
        price: 499.0,
        stock: 8,
        category: 'Monitores',
        description: 'Monitor profesional 4K UHD con HDR600.',
      },
    ]);

    const count = await Product.countDocuments();
    assert.strictEqual(count, 4);
  });

  test('3. Query: products - Obtener todos los productos sin filtro', async () => {
    const GET_ALL_QUERY = `#graphql
      query GetAll {
        products {
          id
          name
          price
          category
          stock
        }
      }
    `;

    const response = await testServer.executeOperation({ query: GET_ALL_QUERY });
    assert.strictEqual(response.body.kind, 'single');
    assert.strictEqual(response.body.singleResult.errors, undefined);
    assert.strictEqual(response.body.singleResult.data.products.length, 4);
  });

  test('4. Query: products con filtro por categoría', async () => {
    const FILTER_CATEGORY_QUERY = `#graphql
      query FilterByCategory($filter: ProductFilterInput) {
        products(filter: $filter) {
          id
          name
          category
        }
      }
    `;

    const response = await testServer.executeOperation({
      query: FILTER_CATEGORY_QUERY,
      variables: {
        filter: {
          category: 'Accesorios',
        },
      },
    });

    assert.strictEqual(response.body.kind, 'single');
    assert.strictEqual(response.body.singleResult.errors, undefined);
    const products = response.body.singleResult.data.products;
    assert.strictEqual(products.length, 2);
    assert.ok(products.every((p) => p.category === 'Accesorios'));
  });

  test('5. Query: products con filtro por rango de precios (minPrice y maxPrice)', async () => {
    const FILTER_PRICE_QUERY = `#graphql
      query FilterByPrice($filter: ProductFilterInput) {
        products(filter: $filter) {
          id
          name
          price
        }
      }
    `;

    const response = await testServer.executeOperation({
      query: FILTER_PRICE_QUERY,
      variables: {
        filter: {
          minPrice: 50.0,
          maxPrice: 600.0,
        },
      },
    });

    assert.strictEqual(response.body.kind, 'single');
    assert.strictEqual(response.body.singleResult.errors, undefined);
    const products = response.body.singleResult.data.products;
    assert.strictEqual(products.length, 2); // Teclado ($89.99) y Monitor ($499.0)
  });

  test('6. Query: products con filtro de stock disponible (inStock: true)', async () => {
    const FILTER_STOCK_QUERY = `#graphql
      query FilterInStock($filter: ProductFilterInput) {
        products(filter: $filter) {
          id
          name
          stock
        }
      }
    `;

    const response = await testServer.executeOperation({
      query: FILTER_STOCK_QUERY,
      variables: {
        filter: {
          inStock: true,
        },
      },
    });

    assert.strictEqual(response.body.kind, 'single');
    assert.strictEqual(response.body.singleResult.errors, undefined);
    const products = response.body.singleResult.data.products;
    assert.strictEqual(products.length, 3);
    assert.ok(products.every((p) => p.stock > 0));
  });

  test('7. Query: products con búsqueda por texto (search)', async () => {
    const SEARCH_QUERY = `#graphql
      query Search($filter: ProductFilterInput) {
        products(filter: $filter) {
          id
          name
        }
      }
    `;

    const response = await testServer.executeOperation({
      query: SEARCH_QUERY,
      variables: {
        filter: {
          search: 'ultrabook',
        },
      },
    });

    assert.strictEqual(response.body.kind, 'single');
    assert.strictEqual(response.body.singleResult.errors, undefined);
    const products = response.body.singleResult.data.products;
    assert.strictEqual(products.length, 1);
    assert.strictEqual(products[0].name, 'Laptop Ultrabook Pro 14');
  });

  test('8. Mutación: updateProduct - Actualizar precio y stock de un producto', async () => {
    const existing = await Product.findOne({ name: 'Laptop Ultrabook Pro 14' });
    assert.ok(existing);

    const UPDATE_MUTATION = `#graphql
      mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
        updateProduct(id: $id, input: $input) {
          id
          name
          price
          stock
          description
        }
      }
    `;

    const response = await testServer.executeOperation({
      query: UPDATE_MUTATION,
      variables: {
        id: existing._id.toString(),
        input: {
          price: 1099.99,
          stock: 20,
          description: 'Precio de oferta especial de lanzamiento.',
        },
      },
    });

    assert.strictEqual(response.body.kind, 'single');
    assert.strictEqual(response.body.singleResult.errors, undefined);
    const updated = response.body.singleResult.data.updateProduct;
    assert.strictEqual(updated.price, 1099.99);
    assert.strictEqual(updated.stock, 20);
    assert.strictEqual(updated.description, 'Precio de oferta especial de lanzamiento.');
    assert.strictEqual(updated.name, 'Laptop Ultrabook Pro 14');
  });

  test('9. Query: product(id) - Obtener producto específico por ID', async () => {
    const existing = await Product.findOne({ name: 'Laptop Ultrabook Pro 14' });
    assert.ok(existing);

    const GET_BY_ID_QUERY = `#graphql
      query GetById($id: ID!) {
        product(id: $id) {
          id
          name
          price
          stock
        }
      }
    `;

    const response = await testServer.executeOperation({
      query: GET_BY_ID_QUERY,
      variables: {
        id: existing._id.toString(),
      },
    });

    assert.strictEqual(response.body.kind, 'single');
    assert.strictEqual(response.body.singleResult.errors, undefined);
    assert.strictEqual(response.body.singleResult.data.product.name, 'Laptop Ultrabook Pro 14');
    assert.strictEqual(response.body.singleResult.data.product.price, 1099.99);
  });

  test('10. Query: categories - Obtener lista de categorías únicas', async () => {
    const GET_CATEGORIES = `#graphql
      query GetCategories {
        categories
      }
    `;

    const response = await testServer.executeOperation({ query: GET_CATEGORIES });
    assert.strictEqual(response.body.kind, 'single');
    assert.strictEqual(response.body.singleResult.errors, undefined);
    const categories = response.body.singleResult.data.categories;
    assert.ok(Array.isArray(categories));
    assert.ok(categories.includes('Accesorios'));
    assert.ok(categories.includes('Computación'));
    assert.ok(categories.includes('Monitores'));
  });

  test('11. Mutación: deleteProduct - Eliminar un producto', async () => {
    const existing = await Product.findOne({ name: 'Mouse Inalámbrico Ergo' });
    assert.ok(existing);

    const DELETE_MUTATION = `#graphql
      mutation DeleteProduct($id: ID!) {
        deleteProduct(id: $id)
      }
    `;

    const response = await testServer.executeOperation({
      query: DELETE_MUTATION,
      variables: {
        id: existing._id.toString(),
      },
    });

    assert.strictEqual(response.body.kind, 'single');
    assert.strictEqual(response.body.singleResult.errors, undefined);
    assert.strictEqual(response.body.singleResult.data.deleteProduct, true);

    const afterDelete = await Product.findById(existing._id);
    assert.strictEqual(afterDelete, null);
  });
});
