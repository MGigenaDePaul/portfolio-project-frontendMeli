# Mercado Libre - Frontend Challenge

# React + Vite

Web application built with React that simulates the main functionalities of Mercado Libre: product search, results display, and product details.

## Features

- 🔍 Product search
- 📋 Results listing (maximum 4 products)
- 📦 Individual product detail
- 🧭 Navigation breadcrumb
- 📱 Responsive design

## Technologies

- React
- React Router
- CSS/Sass
- Vite
- Prettier (code formatting)

## Installation and Setup

1. Clone the repository:

```bash
git clone https://github.com/your-username/meli-frontend-test.git
cd meli-frontend-test
```

2. Install dependencies:

```bash
npm install
```

3. Run the application:

```bash
npm run dev
```

4. Open in browser:

```
http://localhost:5173
```

When you add, remove, or update products in products.json and want to keep
productDetail.json perfectly in sync without manual work.

```bash
node scripts/makeProductDetail.js src/data/products.json src/data/productDetail.json
```

What this command does:

📦 Reads all products from products.json

📖 Reads existing product details from productDetail.json (details array)

➕ Adds new products to productDetail.json when their ID exists in products.json

🖼️ Updates images only (thumbnail → fullImage) for products that already exist
(keeps description, sold_quantity, condition, etc. untouched)

❌ Removes products from productDetail.json if their ID no longer exists in products.json

🆔 Uses IDs as unique identifiers (order does NOT matter)

🔢 Sorts products by numeric ID (MLA2 → MLA10 → MLA620)

💾 Saves a clean, merged result to productDetail.json

🔁 Safe to run multiple times (idempotent)

### ARCHIVO helpers.js esta organizado de la siguiente manera

filtra por autos + marca
filtra por camaras (normales y de seguridad)
filtra por ropa
filtra por carnes
filtra por bicicletas
filtra por celulares

Developed as a technical challenge for Mercado Libre.
