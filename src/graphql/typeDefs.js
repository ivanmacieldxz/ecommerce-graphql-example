export const typeDefs = `#graphql
  type Product {
    id: ID!
    name: String!
    price: Float!
    stock: Int!
    category: String!
    description: String
    createdAt: String
    updatedAt: String
  }

  input ProductFilterInput {
    category: String
    minPrice: Float
    maxPrice: Float
    inStock: Boolean
    search: String
  }

  input CreateProductInput {
    name: String!
    price: Float!
    stock: Int!
    category: String!
    description: String
  }

  input UpdateProductInput {
    name: String
    price: Float
    stock: Int
    category: String
    description: String
  }

  type Query {
    """
    Obtiene la lista de productos con soporte para filtros opcionales (categoría, rango de precios, stock, búsqueda por texto).
    """
    products(filter: ProductFilterInput): [Product!]!

    """
    Obtiene un producto específico a través de su ID.
    """
    product(id: ID!): Product

    """
    Obtiene la lista de categorías únicas existentes en los productos.
    """
    categories: [String!]!
  }

  type Mutation {
    """
    Crea un nuevo producto en la base de datos.
    """
    createProduct(input: CreateProductInput!): Product!

    """
    Actualiza los campos de un producto existente por su ID.
    """
    updateProduct(id: ID!, input: UpdateProductInput!): Product!

    """
    Elimina un producto por su ID.
    """
    deleteProduct(id: ID!): Boolean!
  }
`;
