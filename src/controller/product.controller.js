const { sequelize } = require("../db.js");
const { Product } = require("../models/product.model.js");
const DigikeyService = require("../services/digikey.service.js");

class ProductController {
  static async importProducts(req, res) {
    const { partNumbers = [], parallel = false } = req.body;
    if (!Array.isArray(partNumbers) || partNumbers.length === 0) {
      return res
        .status(400)
        .json({ error: "partNumbers phải là mảng chuỗi và không rỗng" });
    }

    try {
      await sequelize.sync();

      let results;
      if (parallel) {
        results = await Promise.all(
          partNumbers.map((pn) => DigikeyService.fetchProduct(pn))
        );
      } else {
        results = [];
        for (const pn of partNumbers) {
          const data = await DigikeyService.fetchProduct(pn);
          results.push(data);
        }
      }

      const toSave = results.filter((x) => x != null);
      if (toSave.length) {
        await Product.bulkCreate(toSave, {
          updateOnDuplicate: Object.keys(Product.rawAttributes),
        });
      }

      return res.json(toSave);
    } catch (err) {
      console.error("Error in importProducts:", err);
      return res.status(500).json({ error: "Lỗi server khi import sản phẩm" });
    }
  }

  static async listProducts(req, res) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const sortBy = req.query.sortBy
    try {
      await sequelize.sync();

      const { count, rows } = await DigikeyService.list({
        page,
        limit,
        search,
        sortBy
      });
      const totalPages = Math.ceil(count / limit);

      return res.json({
        data: rows,
        pagination: { total: count, page, limit, totalPages },
      });
    } catch (err) {
      console.error("Error in listProducts:", err);
      return res
        .status(500)
        .json({ error: "Lỗi server khi lấy danh sách sản phẩm" });
    }
  }

  static async exportProducts(req, res) {
    const { partNumbers = [] } = req.body;
    if (!Array.isArray(partNumbers) || !partNumbers.length) {
      return res
        .status(400)
        .json({ error: "partNumbers phải là mảng và không rỗng" });
    }

    try {
      const products = await DigikeyService.fetchByManufacturerPNs(partNumbers);
      if (!products.length) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy sản phẩm nào với partNumbers đã cho",
          });
      }

      const allFields = Object.keys(Product.rawAttributes).filter(
        (f) => f !== "id"
      );

      const csv = DigikeyService.toCSV(products, allFields);
      res.header("Content-Type", "text/csv");
      res.attachment("products_export.csv");
      return res.send(csv);
    } catch (err) {
      console.error("Error in exportProducts:", err);
      return res.status(500).json({ error: "Lỗi server khi xuất CSV" });
    }
  }

  static async exportExcel(req, res) {
    const { partNumbers = [], sortBy= 'desc' } = req.body;
    if (!Array.isArray(partNumbers) || partNumbers.length === 0) {
      return res
        .status(400)
        .json({ error: "partNumbers phải là mảng và không rỗng" });
    }

    try {
      const products = await DigikeyService.fetchByManufacturerPNs(partNumbers);
      if (!products.length) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy sản phẩm nào với partNumbers đã cho",
          });
      }

      const workbook = await DigikeyService.buildWorkbook(products, sortBy);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=products_export.xlsx"
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error("Error in exportExcel:", err);
      return res.status(500).json({ error: "Lỗi server khi xuất Excel" });
    }
  }

  static async deleteAllProduct(req,res) {
    try { 
      await DigikeyService.deleteAllData();
      return res.json({ message: 'Đã xóa tất cả sản phẩm.' }); 
    } catch(err) {
      console.log(err, 'err');
      return res.status(500).json({ err: 'Lỗi server khi xóa sản phẩm' });
    }
  }
}

module.exports = ProductController;
