const joi = require('joi')
const { divisi } = require('../models')
const { Op } = require('sequelize')
const { pagination } = require('../helpers/pagination')
const response = require('../helpers/response')

module.exports = {
  createDivisi: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        divisi: joi.string().required(),
        status: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await divisi.findAll({ where: { divisi: results.divisi } })
          if (result) {
            return response(res, 'division already exists', {}, 404, false)
          } else {
            const result = await divisi.create(results)
            if (result) {
              return response(res, 'division created', { result })
            } else {
              return response(res, 'failed to create division', {}, 404, false)
            }
          }
        } else {
          return response(res, "you're not super administrator", {}, 404, false)
        }
      }
    } catch (error) {
      response(res, error.message, {}, 500, false)
    }
  },
  updateDivisi: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        divisi: joi.string(),
        status: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await divisi.findAll({
            where: {
              divisi: results.divisi,
              [Op.not]: { id: id }
            }
          })
          if (result.length > 0) {
            return response(res, 'divisi already exist', {}, 404, false)
          } else {
            const result = await divisi.findByPk(id)
            if (result) {
              divisi.update(results)
              return response(res, 'successfully update divisi', { result })
            } else {
              return response(res, 'failed to update divisi', {}, 404, false)
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
  deleteDivisi: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await divisi.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'succesfully delete divisi')
        } else {
          return response(res, `divisi with id ${id} not found`, {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDivisi: async (req, res) => {
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
      const result = await divisi.findAndCountAll({
        where: {
          [Op.like]: `%${searchValue}%`
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/divisi/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list divisi', { result, pageInfo })
      } else {
        return response(res, 'failed to get divisi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailDivisi: async (req, res) => {
    try {
      const id = req.params.id
      const result = await divisi.findByPk(id)
      if (result) {
        return response(res, `succesfully get divisi with id ${id}`, { result })
      } else {
        return response(res, 'faileed to get divisi', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
