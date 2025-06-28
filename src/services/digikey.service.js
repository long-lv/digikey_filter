const axios = require("axios");
const AuthService = require("./auth.service.js");
const { getParam, parseTemperatureRange } = require("../utils/utils.js");
const { Product } = require("../models/product.model.js");
const { Op } = require("sequelize");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const { sequelize } = require("../db.js");

const SEARCH_URL = "https://api.digikey.com/products/v4/search/keyword";

class DigikeyService {
  static async fetchProduct(partNumber) {
    try {
      return await this._fetch(partNumber);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.warn("Token hết hạn, refresh và retry...");
        AuthService.resetToken();
        return await this._fetch(partNumber);
      }
      console.error(
        `Lỗi khi fetch ${partNumber}:`,
        err.response?.data || err.message
      );
      return null;
    }
  }

  static async _fetch(partNumber) {
    const token = await AuthService.getAccessToken();
    const resp = await axios.post(
      SEARCH_URL,
      {
        Keywords: partNumber,
        RecordCount: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-DIGIKEY-Client-Id":
            "77pndBnY7E2w2DG2za7JZr2kPz8349BAtOUdizx3sUtJCMlP",
          "Content-Type": "application/json",
        },
      }
    );

    const product = resp.data.Products?.[0];
    if (!product) return null;

    const params = product.Parameters || [];
    const tempRange = parseTemperatureRange(params, "Operating Temperature");
    console.log(product.Category?.FilterOptions, 'asdasdasd');
    return {
      spnMouserPartNumFormattedForProdInfo:
        product.ProductVariations?.[0]?.DigiKeyProductNumber || null,
      spnManufacturerPartNumber: product.ManufacturerProductNumber,
      manufacturer: product.Manufacturer?.Name,
      defaultImg: product.PhotoUrl,
      price1: product.UnitPrice,
      datasheet: product.DatasheetUrl,
      spnDescription: product.Description?.ProductDescription,
      product: product.Category?.Name || null,
      productClassification:
        (product.Category?.ChildCategories || [])
          .map((cat) => cat.Name)
          .join("; ") || null,
      series: product.Series?.Name,
      packaging: (product.Category?.FilterOptions?.Packaging || [])
          .map((pk) => pk.Value)
          .join("; ") || null,
      partStatus: product.ProductStatus?.Status,
      numberOfChannels: getParam(params, "Number of Channels"),
      interface: getParam(params, "Interface"),
      voltageSupply: getParam(params, "Voltage - Supply"),
      // operatingTemperature: getParam(params, "Operating Temperature"),
      operatingTemperatureMax: tempRange && tempRange?.max ? tempRange.max : "",
      operatingTemperatureMin: tempRange && tempRange?.min ? tempRange.min : "",
      mountingType: getParam(params, "Mounting Type"),
      packageOrCase: getParam(params, "Package / Case"),
      numberOfRegulators: getParam(params, "Number of Regulators"),
      numberOfPositions: getParam(params, "Number of Positions"),
      voltageRating: getParam(params, "Voltage Rating"),
      voltageInput: getParam(params, "Voltage - Input"),
      voltageOutput: getParam(params, "Voltage - Output"),
      connectorType: getParam(params, "Connector Type"),
      impedance: getParam(params, "Impedance"),
      touchPanel: getParam(params, "Touch Panel"),
      moduleSize: getParam(params, "Module Size"),
      illuminationColor: getParam(params, "Illumination Color"),
      waveLength: getParam(params, "Wavelength"),
      ifForwardCurrent: getParam(params, "If - Forward Current"),
      vfForwardVoltage: getParam(params, "Vf - Forward Voltage"),
      type: getParam(params, "Type"),
      qualification: getParam(params, "Qualification"),
      dimensions: getParam(params, "Dimensions"),
    };
  }

  static async list({ page = 1, limit = 20, search, sortBy = "asc" }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where.spnManufacturerPartNumber = { [Op.like]: `%${search}%` };
    }

    return Product.findAndCountAll({
      where,
      offset,
      limit,
      order: [["createdAt", sortBy]],
    });
  }

  static async fetchByManufacturerPNs(partNumbers) {
    return Product.findAll({
      where: {
        spnManufacturerPartNumber: { [Op.in]: partNumbers },
      },
      order: [["createdAt", "desc"]],
      raw: true,
    });
  }

  static toCSV(data, fields) {
    const parser = new Parser({ fields });
    return parser.parse(data);
  }

  static async buildWorkbook(data) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Products");

    if (!data.length) return workbook;

    const keys = Object.keys(data[0]);

    sheet.columns = keys.map((key) => {
      if (key === "id") {
        return { header: "id", key, width: 10 };
      }
      return { header: key, key, width: 40 };
    });

    data.forEach((item) => sheet.addRow(item));
    sheet.columns.forEach((column) => {
      if (column.key !== "id") {
        let maxLength = column.header.length;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const val = cell.value ? cell.value.toString() : "";
          maxLength = Math.max(maxLength, val.length);
        });
        column.width = Math.ceil(maxLength * 1.2);
      }
    });

    return workbook;
  }

  static async deleteAllData() {
    await sequelize.sync();

    return Product.destroy({
      where: {},
      truncate: true,
    });
  }
}

module.exports = DigikeyService;
