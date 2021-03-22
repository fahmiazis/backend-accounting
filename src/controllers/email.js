const { email, sequelize } = require('../models')
const joi = require('joi')
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
const mailer = require('../helpers/mailer')

module.exports = {
  addEmail: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        kode_plant: joi.string().required(),
        area: joi.string().required(),
        email_bm: joi.string().required().email(),
        email_aos: joi.string().required().email(),
        email_sa: joi.string().email(),
        email_ho_pic: joi.string().email().required(),
        email_grom: joi.string().email().required(),
        email_rom: joi.string().email().required(),
        email_ho_1: joi.string().email(),
        email_ho_2: joi.string().email(),
        email_ho_3: joi.string().email(),
        email_ho_4: joi.string().email()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await email.findAll({ where: { kode_plant: results.kode_plant } })
          if (result.length > 0) {
            return response(res, 'kode plant already exist', {}, 400, false)
          } else {
            const result = await email.create(results)
            if (result) {
              return response(res, 'successfully add email', { result })
            } else {
              return response(res, 'failed to add email', {}, 400, false)
            }
          }
        } else {
          return response(res, "you're not super administrator", {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getEmail: async (req, res) => {
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
      const result = await email.findAndCountAll({
        where: {
          [Op.or]: [
            { kode_plant: { [Op.like]: `%${searchValue}%` } },
            { area: { [Op.like]: `%${searchValue}%` } },
            { email_aos: { [Op.like]: `%${searchValue}%` } },
            { email_grom: { [Op.like]: `%${searchValue}%` } },
            { email_bm: { [Op.like]: `%${searchValue}%` } },
            { email_sa: { [Op.like]: `%${searchValue}%` } },
            { email_rom: { [Op.like]: `%${searchValue}%` } },
            { email_ho_pic: { [Op.like]: `%${searchValue}%` } },
            { email_ho_1: { [Op.like]: `%${searchValue}%` } },
            { email_ho_2: { [Op.like]: `%${searchValue}%` } },
            { email_ho_3: { [Op.like]: `%${searchValue}%` } },
            { email_ho_4: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/email/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list users', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailEmail: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        kode_plant: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (results.kode_plant) {
          const result = await email.findOne({ where: { kode_plant: results.kode_plant } })
          if (result) {
            return response(res, 'success get email', { result })
          } else {
            return response(res, 'email not found', {}, 404, false)
          }
        } else {
          const result = await email.findByPk(id)
          if (result) {
            return response(res, 'success get email', { result })
          } else {
            return response(res, 'email not found', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateEmail: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        kode_plant: joi.string(),
        area: joi.string().email(),
        email_bm: joi.string().email(),
        email_aos: joi.string().email(),
        email_sa: joi.string().email(),
        email_ho_pic: joi.string().email(),
        email_grom: joi.string().email(),
        email_rom: joi.string().email(),
        email_ho_1: joi.string().email(),
        email_ho_2: joi.string().email(),
        email_ho_3: joi.string().email(),
        email_ho_4: joi.string().email()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          if (results.kode_plant) {
            const result = await email.findAll({
              where:
              {
                kode_plant: results.kode_plant,
                [Op.not]: { id: id }
              }
            })
            if (result.length > 0) {
              return response(res, 'kode plant already use', {}, 400, false)
            } else {
              const result = await email.findByPk(id)
              if (result) {
                await result.update(results)
                return response(res, 'successfully update email', { result })
              } else {
                return response(res, 'failed update email', {}, 404, false)
              }
            }
          } else {
            const result = await email.findByPk(id)
            if (result) {
              await result.update(results)
              return response(res, 'successfully update email', { result })
            } else {
              return response(res, 'failed update email', {}, 404, false)
            }
          }
        } else {
          return response(res, "you're not super administrator", {}, 400, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteEmail: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await email.findByPk(id)
        console.log(result)
        if (result) {
          await result.destroy()
          return response(res, 'successfully delete email', { result })
        } else {
          return response(res, 'failed to delete email', {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterEmail: async (req, res) => {
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
          const cek = ['Kode Plant', 'AREA', 'Email AOS', 'Email HO PIC', 'Email BM', 'Email Grom', 'Email ROM', 'Email HO 1', 'Email HO 2', 'Email HO 3']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            console.log(`${valid[i]} === ${cek[i]}`)
            if (valid[i] === cek[i]) {
              console.log(`${valid[i]} === ${cek[i]}`)
              count.push(1)
            }
          }
          if (count.length === 10) {
            rows.shift()
            const result = await sequelize.query(`INSERT INTO emails (kode_plant, area, email_aos, email_ho_pic, email_bm, email_grom, email_rom, email_ho_1, email_ho_2, email_ho_3) VALUES ${rows.map(a => '(?)').join(',')}`,
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
  exportSqlEmail: async (req, res) => {
    try {
      const result = await email.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['Kode Plant', 'AREA', 'Email AOS', 'Email HO PIC', 'Email BM', 'Email Grom', 'Email ROM', 'Email HO 1', 'Email HO 2', 'Email HO 3']
        const key = ['kode_plant', 'area', 'email_aos', 'email_ho_pic', 'email_bm', 'email_grom', 'email_rom', 'email_ho_1', 'email_ho_2', 'email_ho_3']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-email').concat('.xlsx')
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
  },
  sendMail: async (req, res) => {
    try {
      const mailOptions = {
        from: 'kewekkewek57@gmail.com',
        replyTo: 'kewekkewek57@gmail.com',
        cc: 'sapikewek@gmail.com',
        to: 'fahmiazis797@gmail.com',
        subject: 'coba lagi bre',
        html: 'klik link dibawah untuk reset/ganti password anda \n https://google.com'
      }
      mailer.sendMail(mailOptions, (error, result) => {
        console.log(error)
        console.log(result)
        if (error) {
          return response(res, 'failed to send email', { error: error }, 401, false)
        } else if (result) {
          return response(res, 'success send email', { result: result })
        }
      })
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
