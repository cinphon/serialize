import qs from 'qs'

const DATE_PATTERN = /^_(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z)_$/
const RE_PATTERN = /^_[/](.+)[/]([dgimsuy]*)_$/
const NUMBER_PATTERN = /^_(-?[0-9]+(\.[0-9]+)?)_$/

type TYPE<T> = {
  parse: (str: string) => T | undefined
  stringify: (value: unknown) => string | undefined
}

// const NULL = {
//   match: /^null$/,
//   parse: (str: string) => null,
//   test: (value: any) => value === null,
//   stringify: (value: null) => String(null),
// }

// const INT = {
//   match: /^-?[0-9]+$/,
//   parse: (str: string) => {
//     const int = parseInt(str)
//     return Number.isSafeInteger(int) ? int : str
//   },
//   test: (value: any) => Number.isSafeInteger(value),
//   stringify: (value: number) => value.toFixed(),
// }

const BOOL: TYPE<boolean> = {
  parse: (str: string) => (str === '_true_' ? true : str === '_false_' ? false : undefined),
  stringify: (value: unknown) => (typeof value === 'boolean' ? `_${value}_` : undefined),
}

const NUM: TYPE<number> = {
  parse: (str: string) => {
    let m = str.match(NUMBER_PATTERN)
    if (m?.[1]) {
      const prec = m[1].length - (m[1].startsWith('-') ? 2 : 1)
      const num = parseFloat(m[1])
      if (num.toPrecision(prec) === m[1]) {
        return num
      }
    }
  },
  stringify: (value: unknown) => (typeof value === 'number' ? `_${value.toPrecision()}_` : undefined),
}

const NAN: TYPE<number> = {
  parse: (str: string) => (str === '_NaN_' ? NaN : undefined),
  stringify: (value: unknown) => (Number.isNaN(value) ? '_NaN_' : undefined),
}

const DATE: TYPE<Date> = {
  parse: (str: string) => {
    let m = str.match(DATE_PATTERN)
    if (m?.[1]) {
      return new Date(m[1])
    }
  },
  stringify: (value: unknown) => {
    if (value instanceof Date) {
      try {
        return `_${value.toISOString()}_`
      } catch (e) {
        return '_0000-00-00T00:00:00.000Z_'
      }
    }
  },
}

const RE: TYPE<RegExp> = {
  parse: (str: string) => {
    let m = str.match(RE_PATTERN)
    if (m?.[1]) {
      return new RegExp(m[1], m?.[2] || '')
    }
  },
  stringify: (value: unknown) => (value instanceof RegExp ? `_${value}_` : undefined),
}

const parse = (str: string, ...types: TYPE<any>[]) => {
  for (let t of types) {
    let rst = t.parse(str)
    if (rst !== undefined) {
      return rst
    }
  }

  return unescapeStr(str)
}

const stringify = (value: unknown, ...types: TYPE<any>[]) => {
  for (let t of types) {
    let rst = t.stringify(value)
    if (rst !== undefined) {
      return rst
    }
  }

  if (typeof value === 'string') {
    return escapeStr(value, (s) => types.some((t) => t.parse(s) !== undefined))
  }

  return value
}

const escapeStr = (str: string, check: (s: string) => boolean) => (/^'.*'$/.test(str) || check(str) ? `'${str}'` : str)
const unescapeStr = (str: string) => (/^'.*'$/.test(str) ? str.slice(1, -1) : str)

export const JSONStringify = (data: any) => {
  let reserved = Date.prototype.toJSON
  //@ts-ignore
  delete Date.prototype.toJSON

  const text = JSON.stringify(data, (key, value) => stringify(value, NAN, DATE, RE))

  Date.prototype.toJSON = reserved

  return text
}

export const JSONParse = (text: string) =>
  JSON.parse(text, (key, value) => {
    if (typeof value === 'string') {
      return parse(value, NAN, DATE, RE)
    }

    return value
  })

export const QueryStringify = (data: any) =>
  qs.stringify(data, {
    allowDots: false,
    strictNullHandling: true,
    filter: (prefix, value) => {
      return stringify(value, NAN, BOOL, NUM, DATE, RE)
    },
  })

export const QueryParse = (text: string) =>
  qs.parse(text, {
    allowDots: false,
    strictNullHandling: true,
    decoder: (str, defaultDecoder, charset, type) => {
      str = defaultDecoder(str, charset)

      if (type === 'value') {
        return parse(str, NAN, BOOL, NUM, DATE, RE)
      }

      return str
    },
  })
