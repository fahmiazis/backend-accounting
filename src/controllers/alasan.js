const { alasan } = require('../models')
const response = require('../helpers/response')
const { pagination } = require('../helpers/pagination')
const joi = require('joi')
const { Op } = require('sequelize')

module.exports = {
  createAlasan: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        alasan: joi.string().required(),
        status: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await alasan.findAll({ where: { alasan: results.alasan } })
          if (result) {
            return response(res, 'alasan already exist', {}, 404, false)
          } else {
            const result = await alasan.create(results)
            if (result) {
              return response(res, 'alasan created', { result })
            } else {
              return response(res, 'failed to create alasan', {}, 404, false)
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
  updateAlasan: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        alasan: joi.string(),
        status: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await alasan.findAll({
            where: {
              alasan: results.alasan,
              [Op.not]: { id: id }
            }
          })
          if (result.length > 0) {
            return response(res, 'alasan already exist', {}, 404, false)
          } else {
            const result = await alasan.findByPk(id)
            if (result) {
              alasan.update(results)
              return response(res, 'update alasan successfully', { result })
            } else {
              return response(res, 'failed to update alasan', {}, 404, false)
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
  deleteAlasan: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await alasan.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'succesfully delete alasan')
        } else {
          return response(res, `alasan with id ${id} not found`, {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getAlasan: async (req, res) => {
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
      const result = await alasan.findAndCountAll({
        where: {
          [Op.like]: `%${searchValue}%`
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/alasan/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list alasan', { result, pageInfo })
      } else {
        return response(res, 'failed to get alasan', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailAlasan: async (req, res) => {
    try {
      const id = req.params.id
      const result = await alasan.findByPk(id)
      if (result) {
        return response(res, `succesfully get alasan with id ${id}`, { result })
      } else {
        return response(res, 'faileed to get alasan', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
