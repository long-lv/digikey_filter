// src/controllers/product.controller.js
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
        // Chạy song song
        results = await Promise.all(
          partNumbers.map((pn) => DigikeyService.fetchProduct(pn))
        );
      } else {
        // Chạy tuần tự, đảm bảo mỗi fetch xong mới next
        results = [];
        for (const pn of partNumbers) {
          const data = await DigikeyService.fetchProduct(pn);
          results.push(data);
        }
      }

      // Lọc bỏ null và lưu
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
    const limit = parseInt(req.query.limit, 20) || 20;
    const search = req.query.search;

    try {
      await sequelize.sync();

      const { count, rows } = await DigikeyService.list({
        page,
        limit,
        search,
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
    const { partNumbers = [] } = req.body;
    if (!Array.isArray(partNumbers) || partNumbers.length === 0) {
      return res
        .status(400)
        .json({ error: "partNumbers phải là mảng và không rỗng" });
    }

    try {
      // 1) Lấy data từ DB
      const products = await DigikeyService.fetchByManufacturerPNs(partNumbers);
      if (!products.length) {
        return res
          .status(404)
          .json({
            error: "Không tìm thấy sản phẩm nào với partNumbers đã cho",
          });
      }

      // 2) Xây Workbook
      const workbook = await DigikeyService.buildWorkbook(products);

      // 3) Gửi file dưới dạng stream
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
}

module.exports = ProductController;
