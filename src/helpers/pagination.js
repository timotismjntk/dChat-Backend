const qs = require('querystring')
const {
  APP_URL
} = process.env

module.exports = {
  pagination: (req, totalData) => {
    let { page = 1, limit = 10 } = req.query
    limit = parseInt(limit)
    page = parseInt(page)
    if (page < 1) {
      page = 1
    }
    if (limit < 1 || limit > 100) {
      limit = 5
    }
    const totalPage = Math.ceil(totalData / limit)
    console.log(totalPage)

    const path = req.originalUrl.slice(1).split('?')[0]
    const prev = qs.stringify({ ...req.query, ...{ page: page - 1 } })
    const next = qs.stringify({ ...req.query, ...{ page: page + 1 } })
    console.log(path)
    const prevLink = page > 1 ? `${APP_URL}${path}?${prev}` : null
    const nextLink = page < totalPage ? `${APP_URL}${path}?${next}` : null

    const offset = (page - 1) * limit
    return {
      offset,
      pageInfo: {
        currentPage: page,
        totalPage,
        totalData,
        limitData: limit,
        prevLink,
        nextLink
      }
    }
  }
}
