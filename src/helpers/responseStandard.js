module.exports = (response, message, additionalData, status = 200, success = true) => {
  if (success === false) {
    return response.status(status).send({
      success,
      error: message || 'error',
      ...additionalData
    })
  }
  return response.status(status).send({
    success,
    message: message || 'Success',
    ...additionalData
  })
}
