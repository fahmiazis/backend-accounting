const { email } = require('../models')
const joi = require('joi')
const { pagination } = require('../helpers/pagination')
const response = require('../helpers/response')
const { Op } = require('sequelize')

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
  }
}
