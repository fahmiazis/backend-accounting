const joi = require('joi')
const { depo, sequelize } = require('../models')
const { pagination } = require('../helpers/pagination')
const response = require('../helpers/response')
const { Op, QueryTypes } = require('sequelize')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const uploadMaster = require('../helpers/uploadMaster')
const fs = require('fs')
const excel = require('exceljs')
const vs = require('fs-extra')
const { APP_URL } = process.env

module.exports = {
  createDepo: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        kode_depo: joi.number().required(),
        nama_depo: joi.string().required(),
        home_town: joi.string().required(),
        channel: joi.string().required(),
        distribution: joi.string().required(),
        status_depo: joi.string().required(),
        kode_sap_1: joi.string().required(),
        kode_sap_2: joi.string().required(),
        kode_plant: joi.string().required(),
        nama_grom: joi.string(),
        nama_bm: joi.string(),
        nama_ass: joi.string(),
        nama_pic_1: joi.string(),
        nama_pic_2: joi.string(),
        nama_pic_3: joi.string(),
        nama_pic_4: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await depo.findAll({ where: { kode_depo: results.kode_depo } })
          if (result.length > 0) {
            return response(res, 'kode depo already use', {}, 404, false)
          } else {
            const result = await depo.findAll({ where: { kode_sap_1: results.kode_sap_1 } })
            if (result.length > 0) {
              return response(res, 'kode sap 1 already use', {}, 404, false)
            } else {
              const result = await depo.findAll({ where: { kode_sap_2: results.kode_sap_2 } })
              if (result.length > 0) {
                return response(res, 'kode sap 2 already use', {}, 404, false)
              } else {
                const result = await depo.findAll({ where: { kode_plant: results.kode_plant } })
                if (result.length > 0) {
                  return response(res, 'kode plant already use', {}, 404, false)
                } else {
                  const result = await depo.create(results)
                  if (result) {
                    return response(res, 'succesfully add depo', { result })
                  } else {
                    return response(res, 'failed to add depo', {}, 404, false)
                  }
                }
              }
            }
          }
        } else {
          return response(res, "you're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateDepo: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        kode_depo: joi.number().required(),
        nama_depo: joi.string(),
        home_town: joi.string(),
        channel: joi.string(),
        distribution: joi.string(),
        status_depo: joi.string(),
        kode_sap_1: joi.string().required(),
        kode_sap_2: joi.string().required(),
        kode_plant: joi.string().required(),
        nama_grom: joi.string(),
        nama_bm: joi.string(),
        nama_ass: joi.string(),
        nama_pic_1: joi.string(),
        nama_pic_2: joi.string(),
        nama_pic_3: joi.string(),
        nama_pic_4: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await depo.findAll({ where: { kode_depo: results.kode_depo, [Op.not]: { id: id } } })
          if (result.length > 0) {
            return response(res, 'kode depo already use', {}, 404, false)
          } else {
            const result = await depo.findAll({ where: { kode_sap_1: results.kode_sap_1, [Op.not]: { id: id } } })
            if (result.length > 0) {
              return response(res, 'kode sap 1 already use', {}, 404, false)
            } else {
              const result = await depo.findAll({ where: { kode_sap_2: results.kode_sap_2, [Op.not]: { id: id } } })
              if (result.length > 0) {
                return response(res, 'kode sap 2 already use', {}, 404, false)
              } else {
                const result = await depo.findAll({ where: { kode_plant: results.kode_plant, [Op.not]: { id: id } } })
                if (result.length > 0) {
                  return response(res, 'kode plant already use', {}, 404, false)
                } else {
                  const result = await depo.findByPk(id)
                  if (result) {
                    await result.update(results)
                    return response(res, 'succesfully update depo', { result })
                  } else {
                    return response(res, 'failed to update depo', {}, 404, false)
                  }
                }
              }
            }
          }
        } else {
          return response(res, "you're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteDepo: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await depo.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'succesfully delete depo', { result })
        } else {
          return response(res, 'failed to delete depo', {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDepo: async (req, res) => {
    try {
      let { limit, page, search, sort } = req.query
      let searchValue = ''
      let sortValue = ''
      if (typeof search === 'object') {
        searchValue = Object.values(search)[0]
      } else {
        searchValue = search || ''
      }
      if (typeof sort === 'object') {
        sortValue = Object.values(sort)[0]
      } else {
        sortValue = sort || 'createdAt'
      }
      if (!limit) {
        limit = 5
      } else {
        limit = parseInt(limit)
      }
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      const result = await depo.findAndCountAll({
        where: {
          [Op.or]: [
            { kode_depo: { [Op.like]: `%${searchValue}%` } },
            { nama_depo: { [Op.like]: `%${searchValue}%` } },
            { home_town: { [Op.like]: `%${searchValue}%` } },
            { channel: { [Op.like]: `%${searchValue}%` } },
            { distribution: { [Op.like]: `%${searchValue}%` } },
            { status_depo: { [Op.like]: `%${searchValue}%` } },
            { kode_sap_1: { [Op.like]: `%${searchValue}%` } },
            { kode_sap_2: { [Op.like]: `%${searchValue}%` } },
            { kode_plant: { [Op.like]: `%${searchValue}%` } },
            { nama_grom: { [Op.like]: `%${searchValue}%` } },
            { nama_bm: { [Op.like]: `%${searchValue}%` } },
            { nama_ass: { [Op.like]: `%${searchValue}%` } },
            { nama_pic_1: { [Op.like]: `%${searchValue}%` } },
            { nama_pic_2: { [Op.like]: `%${searchValue}%` } },
            { nama_pic_3: { [Op.like]: `%${searchValue}%` } },
            { nama_pic_4: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/depo/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list users', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailDepo: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        kode_depo: joi.number()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (results.kode_depo) {
          const result = await depo.findOne({ where: { kode_depo: results.kode_depo } })
          if (result) {
            return response(res, 'succes get detail depo', { result })
          } else {
            return response(res, 'failed get detail depo', {}, 404, false)
          }
        } else {
          const result = await depo.findByPk(id)
          if (result) {
            return response(res, 'succes get detail depo', { result })
          } else {
            return response(res, 'failed get detail depo', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterDepo: async (req, res) => {
    const level = req.user.level
    if (level === 1) {
      uploadMaster(req, res, async function (err) {
        try {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length === 0) {
              console.log(err.code === 'LIMIT_UNEXPECTED_FILE' && req.files.length > 0)
              return response(res, 'fieldname doesnt match', {}, 500, false)
            }
            return response(res, err.message, {}, 500, false)
          } else if (err) {
            return response(res, err.message, {}, 401, false)
          }
          const dokumen = `assets/masters/${req.files[0].filename}`
          const rows = await readXlsxFile(dokumen)
          const count = []
          const cek = ['Kode Depo', 'Nama Depo', 'Home Town', 'Channel', 'Distribution', 'Status Depo', 'Kode SAP 1', 'Kode SAP 2', 'Kode Plant', 'Nama GROM', 'Nama BM', 'Nama ASS', 'Nama PIC 1', 'Nama PIC 2', 'Nama PIC 3', 'Nama PIC 4']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            if (valid[i] === cek[i]) {
              console.log(`${valid[i]} === ${cek[i]}`)
              count.push(1)
            }
          }
          if (count.length === cek.length) {
            rows.shift()
            const result = await sequelize.query(`INSERT INTO depos (kode_depo, nama_depo, home_town, channel, distribution, status_depo, kode_sap_1, kode_sap_2, kode_plant, nama_grom, nama_bm, nama_ass, nama_pic_1, nama_pic_2, nama_pic_3, nama_pic_4) VALUES ${rows.map(a => '(?)').join(',')}`,
              {
                replacements: rows,
                type: QueryTypes.INSERT
              })
            if (result) {
              fs.unlink(dokumen, function (err) {
                if (err) throw err
                console.log('success')
              })
              return response(res, 'successfully upload file master')
            } else {
              fs.unlink(dokumen, function (err) {
                if (err) throw err
                console.log('success')
              })
              return response(res, 'failed to upload file', {}, 404, false)
            }
          } else {
            fs.unlink(dokumen, function (err) {
              if (err) throw err
              console.log('success')
            })
            return response(res, 'Failed to upload master file, please use the template provided', {}, 400, false)
          }
        } catch (error) {
          return response(res, error.message, {}, 500, false)
        }
      })
    } else {
      return response(res, "You're not super administrator", {}, 404, false)
    }
  },
  exportSqlDepo: async (req, res) => {
    try {
      const result = await depo.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['Kode Depo', 'Nama Depo', 'Home Town', 'Channel', 'Distribution', 'Status Depo', 'Kode SAP 1', 'Kode SAP 2', 'Kode Plant', 'Nama GROM', 'Nama BM', 'Nama ASS', 'Nama PIC 1', 'Nama PIC 2', 'Nama PIC 3', 'Nama PIC 4']
        const key = ['kode_depo', 'nama_depo', 'home_town', 'channel', 'distribution', 'status_depo', 'kode_sap_1', 'kode_sap_2', 'kode_plant', 'nama_grom', 'nama_bm', 'nama_ass', 'nama_pic_1', 'nama_pic_2', 'nama_pic_3', 'nama_pic_4']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-depo').concat('.xlsx')
          await workbook.xlsx.writeFile(name)
          vs.move(name, `assets/exports/${name}`, function (err) {
            if (err) {
              throw err
            }
            console.log('success')
          })
          return response(res, 'success', { link: `${APP_URL}/download/${name}` })
        } else {
          return response(res, 'failed create file', {}, 404, false)
        }
      } else {
        return response(res, 'failed', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
