require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productsRouter = require('./routes/product.routes.js');
// Import và sync database
const { sequelize } = require('./db.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sync database
sequelize.sync()
  .then(() => console.log('✅ Database synced'))
  .catch(err => console.error('❌ DB sync error:', err));

// Routes
app.use('/api/products', productsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});