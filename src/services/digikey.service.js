const axios = require('axios');
const AuthService = require('./auth.service.js');
const { getParam } = require('../utils/utils.js');
const { Product } = require('../models/product.model.js');
const { Op } = require('sequelize');
const { Parser } = require('json2csv');
const ExcelJS     = require('exceljs');

// Endpoint Digikey expects body { keywords: [ ... ] }
const SEARCH_URL = 'https://api.digikey.com/products/v4/search/keyword';

class DigikeyService {
  /**
   * Lấy data một partNumber, tự động retry nếu token hết hạn (401)
   * @param {string} partNumber
   * @returns {Promise<Object|null>}
   */
  static async fetchProduct(partNumber) {
    try {
      return await this._fetch(partNumber);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.warn('Token hết hạn, refresh và retry...');
        AuthService.resetToken();
        return await this._fetch(partNumber);
      }
      console.error(`Lỗi khi fetch ${partNumber}:`, err.response?.data || err.message);
      return null;
    }
  }

  static async _fetch(partNumber) {
    const token = await AuthService.getAccessToken();
    const resp = await axios.post(
      SEARCH_URL,
      {
        Keywords: partNumber,   // chuỗi trực tiếp
        RecordCount: 1          // bắt buộc nếu bạn muốn API trả về 1 bản ghi
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-DIGIKEY-Client-Id': "77pndBnY7E2w2DG2za7JZr2kPz8349BAtOUdizx3sUtJCMlP",
          'Content-Type': 'application/json'
        }
      }
    );

    const product = resp.data.Products?.[0];
    if (!product) return null;

    const params = product.Parameters || [];
    return {
        spnMouserPartNumFormattedForProdInfo: product.ProductVariations?.[0]?.DigiKeyProductNumber || null,
        spnManufacturerPartNumber:           product.ManufacturerProductNumber,
        manufacturer:                        product.Manufacturer?.Name,
        defaultImg:                          product.PhotoUrl,
        price1:                              product.UnitPrice,
        datasheet:                           product.DatasheetUrl,
        spnDescription:                      product.Description?.ProductDescription,
        product:                             product.Category?.Name || null,
        productClassification:                 (product.Category?.ChildCategories || [])
                                            .map(cat => cat.Name)
                                            .join('; ') || null,
        series:                              product.Series?.Name,
        packaging:                           product.ProductVariations?.[0]?.PackageType?.Name,
        partStatus:                          product.ProductStatus?.Status,
        numberOfChannels:                    getParam(params, 'Number of Channels'),
        interface:                           getParam(params, 'Interface'),
        voltageSupply:                       getParam(params, 'Voltage - Supply'),
        operatingTemperature:                getParam(params, 'Operating Temperature'),
        mountingType:                        getParam(params, 'Mounting Type'),
        packageOrCase:                       getParam(params, 'Package / Case'),
        numberOfRegulators:                  getParam(params, 'Number of Regulators'),
        numberOfPositions:                   getParam(params, 'Number of Positions'),
        voltageRating:                       getParam(params, 'Voltage Rating'),
        voltageInput:                        getParam(params, 'Voltage - Input'),
        voltageOutput:                       getParam(params, 'Voltage - Output'),
        connectorType:                       getParam(params, 'Connector Type'),
        impedance:                           getParam(params, 'Impedance'),
    };
  }

  static async list({ page = 1, limit = 20, search }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where.spnManufacturerPartNumber = { [Op.like]: `%${search}%` };
    }

    return Product.findAndCountAll({
      where,
      offset,
      limit,
      order: [['id', 'desc']],
    });
  }

  static async fetchByManufacturerPNs(partNumbers) {
    return Product.findAll({
      where: {
        spnManufacturerPartNumber: { [Op.in]: partNumbers }
      },
      order: [['id', 'desc']],
      raw: true,
    });
  }

  /**
   * Chuyển mảng object thành CSV string
   * @param {Object[]} data
   * @param {string[]} fields      – danh sách keys cần xuất
   * @returns {string}
   */
  static toCSV(data, fields) {
    const parser = new Parser({ fields });
    return parser.parse(data);
  }

    static async buildWorkbook(data) {
    const workbook = new ExcelJS.Workbook();
    const sheet    = workbook.addWorksheet('Products');

    if (!data.length) return workbook;

    // Lấy tất cả keys
    const keys = Object.keys(data[0]);

    // Gán width đặc biệt cho 'id' và width chung cho các cột còn lại
    sheet.columns = keys.map(key => {
        if (key === 'id') {
        return { header: 'id', key, width: 10 };       // id chỉ rộng 10
        }
        return { header: key, key, width: 40 };          // các cột khác rộng 20
    });

    // Đổ dữ liệu
    data.forEach(item => sheet.addRow(item));

    // Nếu muốn auto–fit các cột khác (ngoại trừ id), bạn có thể lặp và recalcuate width ở đây:
    sheet.columns.forEach(column => {
        if (column.key !== 'id') {
        let maxLength = column.header.length;
        column.eachCell({ includeEmpty: true }, cell => {
            const val = cell.value ? cell.value.toString() : '';
            maxLength = Math.max(maxLength, val.length);
        });
        column.width = Math.ceil(maxLength * 1.2);
        }
    });

    return workbook;
    }
}

module.exports = DigikeyService;