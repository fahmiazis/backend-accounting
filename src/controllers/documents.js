const { pagination } = require('../helpers/pagination')
const { documents, sequelize } = require('../models')
const { Op, QueryTypes } = require('sequelize')
const response = require('../helpers/response')
const joi = require('joi')
const uploadHelper = require('../helpers/upload')
const multer = require('multer')
const readXlsxFile = require('read-excel-file/node')
const uploadMaster = require('../helpers/uploadMaster')
const fs = require('fs')
const excel = require('exceljs')
const vs = require('fs-extra')
const { APP_URL } = process.env

module.exports = {
  addDocument: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        kode_dokumen: joi.string().required(),
        nama_dokumen: joi.string().required(),
        jenis_dokumen: joi.string().required(),
        divisi: joi.string().required(),
        status_depo: joi.string().required(),
        status: joi.string().required(),
        kode_depo: joi.number(),
        lock_dokumen: joi.number(),
        alasan: joi.string(),
        status_dokumen: joi.number()
      })
      const { value: results, error } = schema.validate(req.body)
      console.log(results.kode_dokumen)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await documents.findAll({ where: { kode_dokumen: results.kode_dokumen } })
          if (result.length > 0) {
            return response(res, 'kode dokumen already use', {}, 404, false)
          } else {
            const result = await documents.create(results)
            if (result) {
              return response(res, 'succesfully add dokumen', { result })
            } else {
              return response(res, 'failed to add dokumen', {}, 404, false)
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
  updateDocument: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        kode_dokumen: joi.string(),
        nama_dokumen: joi.string(),
        jenis_dokumen: joi.string(),
        divisi: joi.string(),
        status_depo: joi.string(),
        status: joi.string(),
        kode_depo: joi.number(),
        lock_dokumen: joi.number(),
        alasan: joi.string(),
        status_dokumen: joi.number()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          if (results.kode_dokumen) {
            const result = await documents.findAll({ where: { kode_dokumen: results.kode_dokumen, [Op.not]: { id: id } } })
            if (result.length > 0) {
              return response(res, 'kode dokumen already use', {}, 404, false)
            } else {
              const result = await documents.findByPk(id)
              if (result) {
                await result.update(results)
                return response(res, 'succesfully update dokumen', { result })
              } else {
                return response(res, 'failed to update dokumen', {}, 404, false)
              }
            }
          } else {
            const result = await documents.findByPk(id)
            if (result) {
              await result.update(results)
              return response(res, 'succesfully update dokumen', { result })
            } else {
              return response(res, 'failed to update dokumen', {}, 404, false)
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
  deleteDocuments: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await documents.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'succesfully delete dokumen', { result })
        } else {
          return response(res, 'failed to delete dokumen', {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDocuments: async (req, res) => {
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
      const result = await documents.findAndCountAll({
        where: {
          [Op.or]: [
            { kode_dokumen: { [Op.like]: `%${searchValue}%` } },
            { nama_dokumen: { [Op.like]: `%${searchValue}%` } },
            { jenis_dokumen: { [Op.like]: `%${searchValue}%` } },
            { divisi: { [Op.like]: `%${searchValue}%` } },
            { status_depo: { [Op.like]: `%${searchValue}%` } },
            { status: { [Op.like]: `%${searchValue}%` } },
            { kode_depo: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/dokumen/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list users', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailDocument: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        kode_dokumen: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (results.kode_dokumen) {
          const result = await documents.findOne({ where: { kode_dokumen: results.kode_dokumen } })
          if (result) {
            return response(res, 'succes get detail dokumen', { result })
          } else {
            return response(res, 'failed get detail dokumen', {}, 404, false)
          }
        } else {
          const result = await documents.findByPk(id)
          if (result) {
            return response(res, 'succes get detail dokumen', { result })
          } else {
            return response(res, 'failed get detail dokumen', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadDocument: async (req, res) => {
    const id = req.params.id
    uploadHelper(req, res, async function (err) {
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
        let dokumen = ''
        for (let x = 0; x < req.files.length; x++) {
          const path = `/uploads/${req.files[x].filename}`
          dokumen += path + ', '
          if (x === req.files.length - 1) {
            dokumen = dokumen.slice(0, dokumen.length - 2)
          }
        }
        const result = await documents.findByPk(id)
        if (result) {
          const send = { status_dokumen: 1, path: dokumen }
          await result.update(send)
          return response(res, 'successfully upload dokumen', { result })
        } else {
          return response(res, 'failed to upload dokumen', {}, 404, false)
        }
      } catch (error) {
        return response(res, error.message, {}, 500, false)
      }
    })
  },
  approveDocument: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await documents.findByPk(id)
        const approve = { status_dokumen: 3 }
        if (result) {
          await result.update(approve)
          return response(res, 'succes approve dokumen', { result })
        } else {
          return response(res, 'failed approve dokumen', {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  rejectDocument: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        alasan: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 404, false)
      } else {
        if (level === 1) {
          const result = await documents.findByPk(id)
          const send = {
            alasan: results.alasan,
            status_dokumen: 0
          }
          if (result) {
            await result.update(send)
            return response(res, 'succes reject dokumen', { result })
          } else {
            return response(res, 'failed reject dokumen', {}, 404, false)
          }
        } else {
          return response(res, "you're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterDokumen: async (req, res) => {
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
          const cek = ['Kode Dokumen', 'Nama Dokumen', 'Jenis Dokumen', 'Divisi', 'Status Depo']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            if (valid[i] === cek[i]) {
              count.push(1)
            }
          }
          if (count.length === cek.length) {
            rows.shift()
            const result = await sequelize.query(`INSERT INTO documents (kode_dokumen, nama_dokumen, jenis_dokumen, divisi, status_depo) VALUES ${rows.map(a => '(?)').join(',')}`,
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
  exportSqlDocument: async (req, res) => {
    try {
      const result = await documents.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['Kode Dokumen', 'Nama Dokumen', 'Jenis Dokumen', 'Divisi', 'Status Depo']
        const key = ['kode_dokumen', 'nama_dokumen', 'jenis_dokumen', 'divisi', 'status_depo']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-dokumen').concat('.xlsx')
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
