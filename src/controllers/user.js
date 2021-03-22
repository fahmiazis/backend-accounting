const joi = require('joi')
const response = require('../helpers/response')
const { users, sequelize } = require('../models')
const bcrypt = require('bcryptjs')
const { Op, QueryTypes } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const readXlsxFile = require('read-excel-file/node')
const multer = require('multer')
const uploadMaster = require('../helpers/uploadMaster')
const fs = require('fs')
const excel = require('exceljs')
const vs = require('fs-extra')
const { APP_URL } = process.env

module.exports = {
  addUser: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        username: joi.string().required(),
        password: joi.string().required(),
        kode_depo: joi.number(),
        nama_depo: joi.string(),
        user_level: joi.number().required(),
        status: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await users.findAll({ where: { username: results.username } })
          if (result.length > 0) {
            return response(res, 'username already use', {}, 404, false)
          } else {
            const result = await users.findAll({ where: { kode_depo: results.kode_depo } })
            if (result.length > 0) {
              return response(res, 'kode depo already use', {}, 404, false)
            } else {
              results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
              const result = await users.create(results)
              if (result) {
                return response(res, 'Add User succesfully', { result })
              } else {
                return response(res, 'Fail to create user', {}, 400, false)
              }
            }
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  updateUser: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        username: joi.string(),
        password: joi.string(),
        kode_depo: joi.number(),
        nama_depo: joi.string(),
        user_level: joi.number(),
        status: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          if (results.username) {
            const result = await users.findAll({
              where: {
                username: results.username,
                [Op.not]: { id: id }
              }
            })
            if (result.length > 0) {
              return response(res, 'username already use', { result }, 404, false)
            } else {
              if (results.password) {
                results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
                const result = await users.findByPk(id)
                if (result) {
                  await result.update(results)
                  return response(res, 'update User succesfully', { result })
                } else {
                  return response(res, 'Fail to update user', {}, 400, false)
                }
              } else {
                const result = await users.findByPk(id)
                if (result) {
                  await result.update(results)
                  return response(res, 'update User succesfully', { result })
                } else {
                  return response(res, 'Fail to update user', {}, 400, false)
                }
              }
            }
          } else {
            if (results.password) {
              results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
              const result = await users.findByPk(id)
              if (result) {
                await result.update(results)
                return response(res, 'update User succesfully', { result })
              } else {
                return response(res, 'Fail to update user', {}, 400, false)
              }
            } else if (results.kode_depo) {
              const result = await users.findAll({
                where: {
                  kode_depo: results.kode_depo,
                  [Op.not]: { id: id }
                }
              })
              if (result.length > 0) {
                return response(res, 'depo code already use', {}, 404, false)
              } else {
                if (results.password) {
                  results.password = await bcrypt.hash(results.password, await bcrypt.genSalt())
                  const result = await users.findByPk(id)
                  if (result) {
                    await result.update(results)
                    return response(res, 'update User succesfully', { result })
                  } else {
                    return response(res, 'Fail to update user', {}, 400, false)
                  }
                } else {
                  const result = await users.findByPk(id)
                  if (result) {
                    await result.update(results)
                    return response(res, 'update user succesfully', { result })
                  } else {
                    return response(res, 'failed to update user', {}, 400, false)
                  }
                }
              }
            } else {
              const result = await users.findByPk(id)
              if (result) {
                await result.update(results)
                return response(res, 'update User succesfully', { result })
              } else {
                return response(res, 'Fail to update user', {}, 400, false)
              }
            }
          }
        } else {
          return response(res, "You're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deleteUser: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await users.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'delete user success', { result })
        } else {
          return response(res, 'user not found', {}, 404, false)
        }
      } else {
        return response(res, "You're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getUsers: async (req, res) => {
    try {
      const idUser = req.user.id ? req.user.id : 0
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
      const result = await users.findAndCountAll({
        where: {
          [Op.or]: [
            { username: { [Op.like]: `%${searchValue}%` } },
            { kode_depo: { [Op.like]: `%${searchValue}%` } },
            { nama_depo: { [Op.like]: `%${searchValue}%` } },
            { phone: { [Op.like]: `%${searchValue}%` } }
          ],
          [Op.not]: { id: idUser }
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/user/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list users', { result, pageInfo })
      } else {
        return response(res, 'failed to get user', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailUser: async (req, res) => {
    try {
      const id = req.params.id
      const result = await users.findByPk(id)
      if (result) {
        return response(res, `Profile of user with id ${id}`, { result })
      } else {
        return response(res, 'fail to get user', {}, 400, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  uploadMasterUser: async (req, res) => {
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
          const cek = ['User Name', 'Password', 'Kode Depo', 'User Level']
          const valid = rows[0]
          for (let i = 0; i < cek.length; i++) {
            if (valid[i] === cek[i]) {
              count.push(1)
            }
          }
          if (count.length === 4) {
            rows.shift()
            const create = []
            for (let i = 0; i < rows.length; i++) {
              const noun = []
              const process = rows[i]
              for (let j = 0; j < process.length; j++) {
                if (j === 1) {
                  let str = process[j]
                  str = await bcrypt.hash(str, await bcrypt.genSalt())
                  noun.push(str)
                } else {
                  noun.push(process[j])
                }
              }
              create.push(noun)
            }
            const result = await sequelize.query(`INSERT INTO users (username, password, kode_depo, user_level) VALUES ${create.map(a => '(?)').join(',')}`,
              {
                replacements: create,
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
  exportSqlUser: async (req, res) => {
    try {
      const result = await users.findAll()
      if (result) {
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet()
        const arr = []
        const header = ['User Name', 'Password', 'Kode Depo', 'User Level']
        const key = ['username', 'password', 'kode_depo', 'user_level']
        for (let i = 0; i < header.length; i++) {
          let temp = { header: header[i], key: key[i] }
          arr.push(temp)
          temp = {}
        }
        worksheet.columns = arr
        const cek = worksheet.addRows(result)
        if (cek) {
          const name = new Date().getTime().toString().concat('-user').concat('.xlsx')
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
