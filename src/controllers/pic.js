const { pic } = require('../models')
const joi = require('joi')
const response = require('../helpers/response')
const { pagination } = require('../helpers/pagination')
const { Op } = require('sequelize')

module.exports = {
  addPic: async (req, res) => {
    try {
      const level = req.user.level
      const schema = joi.object({
        pic: joi.string().required(),
        spv: joi.string().required(),
        divisi: joi.string().required(),
        kode_depo: joi.number().required(),
        nama_depo: joi.string().required(),
        status: joi.string().required()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          const result = await pic.findAll({ where: { kode_depo: results.kode_depo } })
          if (result.length > 0) {
            return response(res, 'kode depo already exist', {}, 404, false)
          } else {
            const result = await pic.create(results)
            if (result) {
              return response(res, 'succesfully add pic', { result })
            } else {
              return response(res, 'failed to add pic', {}, 404, false)
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
  updatePic: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      const schema = joi.object({
        pic: joi.string(),
        spv: joi.string(),
        divisi: joi.string(),
        kode_depo: joi.number(),
        nama_depo: joi.string(),
        status: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (level === 1) {
          if (results.kode_depo) {
            const result = await pic.findAll({
              where: {
                kode_depo: results.kode_depo,
                [Op.not]: { id: id }
              }
            })
            if (result.length > 0) {
              return response(res, 'kode depo already use', {}, 404, false)
            } else {
              const result = await pic.findByPk(id)
              if (result) {
                await result.update(results)
                return response(res, 'successfully update pic', { result })
              } else {
                return response(res, 'failed to update pic', {}, 404, false)
              }
            }
          } else {
            const result = await pic.findByPk(id)
            if (result) {
              await result.update(results)
              return response(res, 'successfully update pic', { result })
            } else {
              return response(res, 'failed to update pic', {}, 404, false)
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
  getPic: async (req, res) => {
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
      const result = await pic.findAndCountAll({
        where: {
          [Op.or]: [
            { pic: { [Op.like]: `${searchValue}` } },
            { kode_depo: { [Op.like]: `${searchValue}` } },
            { spv: { [Op.like]: `${searchValue}` } },
            { divisi: { [Op.like]: `%${searchValue}%` } },
            { nama_depo: { [Op.like]: `%${searchValue}%` } },
            { status: { [Op.like]: `%${searchValue}%` } }
          ]
        },
        order: [[sortValue, 'ASC']],
        limit: limit,
        offset: (page - 1) * limit
      })
      const pageInfo = pagination('/pic/get', req.query, page, limit, result.count)
      if (result) {
        return response(res, 'list pic', { result, pageInfo })
      } else {
        return response(res, 'failed to get pic', {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  getDetailPic: async (req, res) => {
    try {
      const id = req.params.id
      const schema = joi.object({
        kode_depo: joi.string()
      })
      const { value: results, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 401, false)
      } else {
        if (results.kode_depo) {
          const result = await pic.findAll({ where: { kode_depo: results.kode_depo } })
          if (result) {
            return response(res, `succesfully get pic with kode depo ${results.kode_depo}`, { result })
          } else {
            return response(res, 'pic not found', {}, 404, false)
          }
        } else {
          const result = await pic.findByPk(id)
          if (result) {
            return response(res, `succesfully get pic with id ${id}`, { result })
          } else {
            return response(res, 'pic not found', {}, 404, false)
          }
        }
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  },
  deletePic: async (req, res) => {
    try {
      const level = req.user.level
      const id = req.params.id
      if (level === 1) {
        const result = await pic.findByPk(id)
        if (result) {
          await result.destroy()
          return response(res, 'succesfully delete pic', { result })
        } else {
          return response(res, 'failed delete pic', {}, 404, false)
        }
      } else {
        return response(res, "you're not super administrator", {}, 404, false)
      }
    } catch (error) {
      return response(res, error.message, {}, 500, false)
    }
  }
}
