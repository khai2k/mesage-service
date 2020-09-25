import axios from 'axios'

const getHeaders = token => {
  let headers = {
    Accept: 'application/json'
  }
  if (token) headers.Authorization = token
  return headers
}

export function putFetch (url, data, props, token) {
  let attributes = Object.assign(
    {
      cache: true,
      headers: getHeaders(token)
    },
    props
  )

  return new Promise((resolve, reject) => {
    axios
      .put(url, data, attributes)
      .then(res => {
        if (res.status === 200) {
          resolve(res.data)
        } else {
          reject(new Error('putFetch: ' + url))
        }
      })
      .catch(e => reject(e))
  })
}

export function postFetch (url, params, header = {}, token) {
  const headers = Object.assign(getHeaders(token), header)
  return new Promise((resolve, reject) => {
    axios
      .post(url, params, {
        cache: true,
        headers
      })
      .then(res => {
        resolve(res.data)
      })
      .catch(e => reject(e))
  })
}

export function getFetch (url, data, props, token) {
  let attributes = Object.assign(
    {
      headers: getHeaders(token)
    },
    props
  )
  return new Promise((resolve, reject) => {
    axios
      .get(url, attributes)
      .then(res => {
        // if (res.status === 200) {
        resolve(res.data)
        // } else {
        //   reject({ error: true })
        // }
      })
      .catch(e => reject(e))
  })
}
