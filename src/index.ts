import qs from 'qs'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/

// For url friendly delimiter, use '~' instead of '/' while the later is DE FACTO in JS
const RE_PATTERN = /^[~](.+)[~]([dgimsuy]*)$/

// Use HEX for safe integer, all UPPERCASE
const INT_PATTERN = /^-?0[X]([0-9A-F]{1,13}|[01][0-9A-F]{13})$/

// Use EXPO for ALL number includes big integer, with '+' following 'e' removed for url friendliness, all UPPERCASE
const NUM_PATTERN = /^-?[1-9](\.[0-9]+)?[E]-?[0-9]+$/

const SPECIAL_NUM_MAP: Record<string, number> = {
  [String(NaN).toUpperCase()]: NaN,
  [String(Infinity).toUpperCase()]: Infinity,
  [String(-Infinity).toUpperCase()]: -Infinity,
}

const SPECIAL_NUM_VALUES = Object.values(SPECIAL_NUM_MAP)

type TYPE<T> = {
  parse: (str: string) => T | undefined
  stringify: (value: unknown) => string | undefined
}

const NULL: TYPE<null> = {
  parse: (str: string) => (str === 'NULL' ? null : undefined),
  stringify: (value: unknown) => (value === null ? 'NULL' : undefined),
}

const BOOL: TYPE<boolean> = {
  parse: (str: string) => (str === 'TRUE' ? true : str === 'FALSE' ? false : undefined),
  stringify: (value: unknown) => (typeof value === 'boolean' ? String(value).toUpperCase() : undefined),
}

const SPECIAL_NUM: TYPE<number> = {
  parse: (str: string) => SPECIAL_NUM_MAP[str],
  stringify: (value: unknown) =>
    SPECIAL_NUM_VALUES.includes(value as number) ? String(value).toUpperCase() : undefined,
}

const NUM: TYPE<number> = {
  parse: (str: string) => {
    if (INT_PATTERN.test(str)) {
      return Number.parseInt(str, 16)
    } else if (NUM_PATTERN.test(str)) {
      return Number.parseFloat(str)
    }
  },
  stringify: (value: unknown) => {
    if (typeof value === 'number') {
      if (Number.isSafeInteger(value)) {
        return ('0x' + value.toString(16)).toUpperCase()
      } else {
        return value.toExponential().replace('e+', 'e').toUpperCase()
      }
    }
  },
}

const DATE: TYPE<Date> = {
  parse: (str: string) => {
    if (DATE_PATTERN.test(str)) {
      return new Date(str)
    }
  },
  stringify: (value: unknown) => {
    if (value instanceof Date) {
      try {
        return value.toISOString()
      } catch (e) {
        return '0000-00-00T00:00:00.000Z'
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
  stringify: (value: unknown) => (value instanceof RegExp ? `~${value.source}~${value.flags}` : undefined),
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

  const text = JSON.stringify(data, (key, value) => stringify(value, SPECIAL_NUM, DATE, RE))

  Date.prototype.toJSON = reserved

  return text
}

export const JSONParse = (text: string) =>
  JSON.parse(text, (key, value) => {
    if (typeof value === 'string') {
      return parse(value, SPECIAL_NUM, DATE, RE)
    }

    return value
  })

export const QueryStringify = (data: any) =>
  qs.stringify(data, {
    allowDots: false,
    strictNullHandling: true,
    encoder: function (str, defaultEncoder, charset, type) {
      if (type === 'key') {
        return str.replaceAll('$', '%24')
      }

      return encodeURIComponent(str)
    },
    filter: (prefix, value) => {
      return stringify(value, SPECIAL_NUM, BOOL, NUM, DATE, RE)
    },
  })

export const QueryParse = (text: string) =>
  qs.parse(text, {
    allowDots: false,
    strictNullHandling: true,
    decoder: (str, defaultDecoder, charset, type) => {
      str = decodeURIComponent(str)

      if (type === 'value') {
        return parse(str, SPECIAL_NUM, BOOL, NUM, DATE, RE)
      }

      return str
    },
  })
