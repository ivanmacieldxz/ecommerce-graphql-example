# API GraphQL de Productos con Express, Apollo Server y MongoDB Atlas

Backend desarrollado en **Node.js (ES Modules)** utilizando **Express**, **Apollo Server v4** y **Mongoose** conectado a **MongoDB Atlas**. Diseñado con soporte completo para introspección, la interfaz de **Apollo Sandbox** activa en cualquier entorno y listo para desplegar en **Render**.

---

## 🛠️ Tecnologías y Librerías

- **Node.js** (v18+) con soporte nativo de **ES Modules** (`"type": "module"`).
- **Express.js** como servidor HTTP base.
- **Apollo Server v4** (`@apollo/server`, `@apollo/server/express4`) para el procesamiento de GraphQL.
- **Mongoose** como ODM para modelado y conexión con MongoDB Atlas.
- **Cors & Dotenv** para gestión de orígenes cruzados y variables de entorno.
- **Apollo Sandbox Landing Page Plugin** embebido para pruebas interactivas en el navegador.

---

## 📁 Estructura del Proyecto

```text
actividad_graphql_mcp/
├── .env                  # Variables de entorno locales (credenciales)
├── .env.example          # Plantilla de variables de entorno
├── .gitignore            # Exclusiones de Git
├── package.json          # Metadatos, dependencias y scripts
├── README.md             # Documentación del proyecto
└── src/
    ├── config/
    │   └── db.js         # Conexión a MongoDB Atlas con Mongoose
    ├── graphql/
    │   ├── resolvers.js  # Resolvers de Queries y Mutations
    │   └── typeDefs.js   # Esquema SDL de GraphQL
    ├── models/
    │   └── Product.js    # Modelo y esquema Mongoose de Producto
    ├── scripts/
    │   └── seed.js       # Script para poblar la base de datos con datos de prueba
    └── index.js          # Punto de entrada y configuración de Express + Apollo
```

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar o navegar al directorio del proyecto

```bash
cd actividad_graphql_mcp
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea o verifica tu archivo `.env` en la raíz del proyecto:

```env
PORT=4000
NODE_ENV=development
MONGODB_USERNAME=tu_usuario_mongodb
MONGODB_PASSWORD=tu_password_mongodb
MONGODB_URI=mongodb+srv://tu_usuario_mongodb:tu_password_mongodb@tu_cluster.mongodb.net/actividad_graphql?retryWrites=true&w=majority&appName=ClusterProductos
```

### 4. (Opcional) Poblar la base de datos con datos de prueba

```bash
npm run seed
```

### 5. Iniciar el servidor

Modo desarrollo (con recarga automática):
```bash
npm run dev
```

Modo producción:
```bash
npm start
```

El servidor estará escuchando en:
- **Apollo Sandbox**: [http://localhost:4000/graphql](http://localhost:4000/graphql)
- **Health Check**: [http://localhost:4000/health](http://localhost:4000/health)

---

## 📋 Esquema GraphQL (SDL)

```graphql
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
  products(filter: ProductFilterInput): [Product!]!
  product(id: ID!): Product
  categories: [String!]!
}

type Mutation {
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: ID!, input: UpdateProductInput!): Product!
  deleteProduct(id: ID!): Boolean!
}
```

---

## 🧪 Ejemplos de Consultas y Mutaciones (para Apollo Sandbox)

Abre **`http://localhost:4000/graphql`** en tu navegador para ejecutar estas operaciones en la interfaz interactiva:

### 1. Obtener todos los productos
```graphql
query GetAllProducts {
  products {
    id
    name
    price
    stock
    category
    description
    createdAt
  }
}
```

### 2. Filtrar productos (por categoría, precio, stock o término de búsqueda)
```graphql
query GetFilteredProducts {
  products(
    filter: {
      category: "Accesorios"
      minPrice: 50.0
      maxPrice: 200.0
      inStock: true
    }
  ) {
    id
    name
    price
    stock
    category
  }
}
```

### 3. Búsqueda por texto
```graphql
query SearchProducts {
  products(filter: { search: "gamer" }) {
    id
    name
    price
    category
    description
  }
}
```

### 4. Obtener un producto por ID
```graphql
query GetProductById($id: ID!) {
  product(id: $id) {
    id
    name
    price
    stock
    category
    description
    createdAt
    updatedAt
  }
}
```
*Variables:*
```json
{
  "id": "PEGA_AQUI_UN_ID_VALIDO"
}
```

### 5. Obtener lista de categorías únicas
```graphql
query GetCategories {
  categories
}
```

### 6. Mutación: Crear un nuevo producto
```graphql
mutation CreateNewProduct($input: CreateProductInput!) {
  createProduct(input: $input) {
    id
    name
    price
    stock
    category
    description
    createdAt
  }
}
```
*Variables:*
```json
{
  "input": {
    "name": "Silla Gamer Ergonómica Cougar",
    "price": 249.99,
    "stock": 7,
    "category": "Mobiliario",
    "description": "Silla ergonómica con soporte lumbar ajustable y reposabrazos 4D."
  }
}
```

### 7. Mutación: Actualizar campos de un producto
```graphql
mutation UpdateExistingProduct($id: ID!, $input: UpdateProductInput!) {
  updateProduct(id: $id, input: $input) {
    id
    name
    price
    stock
    category
    description
    updatedAt
  }
}
```
*Variables:*
```json
{
  "id": "PEGA_AQUI_UN_ID_VALIDO",
  "input": {
    "price": 1399.99,
    "stock": 20
  }
}
```

### 8. Mutación: Eliminar un producto
```graphql
mutation RemoveProduct($id: ID!) {
  deleteProduct(id: $id)
}
```
*Variables:*
```json
{
  "id": "PEGA_AQUI_UN_ID_VALIDO"
}
```

---

## ☁️ Guía de Despliegue en Render

1. Sube este repositorio a **GitHub** o **GitLab**.
2. En tu panel de [Render](https://dashboard.render.com/):
   - Haz clic en **New +** y selecciona **Web Service**.
   - Conecta tu repositorio.
3. Configuración del servicio:
   - **Name**: `actividad-graphql-mcp` (o el nombre de tu preferencia).
   - **Environment**: `Node`.
   - **Region**: Selecciona la más cercana (ej. `Oregon` o `Frankfurt`).
   - **Branch**: `main` (o `master`).
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Variables de entorno (**Environment Variables** en Render):
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = `mongodb+srv://tu_usuario_mongodb:tu_password_mongodb@tu_cluster.mongodb.net/actividad_graphql?retryWrites=true&w=majority&appName=ClusterProductos`
   - `PORT` = `10000` (Render asignará automáticamente su puerto mediante `process.env.PORT`).
5. Health Check Path:
   - Configura `/health` como la ruta de verificación de estado.
6. Haz clic en **Create Web Service**.

Una vez finalizado el despliegue, podrás acceder a la URL proporcionada por Render (por ejemplo `https://tu-servicio.onrender.com/graphql`) y cargar directamente el **Apollo Sandbox** interactivo con introspección activa.
