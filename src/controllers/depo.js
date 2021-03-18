const joi = require('joi')
const { depo } = require('../models')
const { pagination } = require('../helpers/pagination')
const response = require('../helpers/pagination')
const { Op } = require('sequelize')

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
        nama_grom: joi.string().required(),
        nama_bm: joi.string().required(),
        nama_ass: joi.string().required(),
        nama_pic_1: joi.string().required(),
        nama_pic_2: joi.string().required(),
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
  }
}
