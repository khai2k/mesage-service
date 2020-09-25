export function resError(res, error, code) {
  res.json({ error: true, message: error, code })
}

export function resSuccess(res, object = {}, success = true) {
  res.json(Object.assign({}, object, { success }))
}
