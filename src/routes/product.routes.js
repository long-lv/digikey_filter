const express = require('express');
const ProductController = require('../controller/product.controller.js'); 
const router = express.Router();

router.post('/import', ProductController.importProducts.bind(ProductController));
router.get('/list', ProductController.listProducts.bind(ProductController));
router.post('/export', ProductController.exportProducts.bind(ProductController));
router.post('/export-xlsx', ProductController.exportExcel.bind(ProductController));
router.delete('/delete-all', ProductController.deleteAllProduct.bind(ProductController));

module.exports = router;