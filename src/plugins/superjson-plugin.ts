import qs from 'qs'
import superjson from 'superjson'
import { JSONObject, SuperJSONResult } from 'superjson/dist/types'

const ROOT_KEY = '___ROOT___'
const META_KEY = '___META___'

function isPlainObject(obj: any): obj is JSONObject {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function hasProperty(obj: any, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function encodeValue(value: any): JSONObject {
  if (isPlainObject(value)) {
    delete value[ROOT_KEY]
    delete value[META_KEY]
  }

  let { json, meta } = superjson.serialize(value)

  if (!isPlainObject(json)) {
    json = { [ROOT_KEY]: json }
  }

  if (meta) {
    json[META_KEY] = meta
  }

  return json
}

function decodeValue(obj: JSONObject) {
  const meta = obj[META_KEY] as SuperJSONResult['meta']
  delete obj[META_KEY]
  const json = hasProperty(obj, ROOT_KEY) ? obj[ROOT_KEY] : obj

  return superjson.deserialize({ json, meta })
}

export const JSONStringify = (data: any) => {
  return JSON.stringify(encodeValue(data))
}

export const JSONParse = (text: string) => {
  const obj = JSON.parse(text)
  return isPlainObject(obj) ? decodeValue(obj) : undefined
}

export const QueryStringify = (data: Record<string, any>) => {
  return qs.stringify(encodeValue(data), {
    allowDots: false,
    strictNullHandling: true,
  })
}

export const QueryParse = (text: string) => {
  const obj = qs.parse(text, {
    allowDots: false,
    strictNullHandling: true,
  })

  return decodeValue(obj)
}

// export const QueryStringify = (data: any) =>
//   qs.stringify(data, {
//     allowDots: false,
//     strictNullHandling: true,
//     filter: (prefix, value) => {
//       return stringify(value, NAN, BOOL, NUM, DATE, RE)
//     },
//   })

// export const QueryParse = (text: string) =>
//   qs.parse(text, {
//     allowDots: false,
//     strictNullHandling: true,
//     decoder: (str, defaultDecoder, charset, type) => {
//       str = defaultDecoder(str, charset)

//       if (type === 'value') {
//         return parse(str, NAN, BOOL, NUM, DATE, RE)
//       }

//       return str
//     },
//   })
