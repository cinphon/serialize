import deepEqual from 'deep-equal'
import { JSONParse, JSONStringify, QueryParse, QueryStringify } from '../src'

const debug = require('debug')('cinphon:serialize')

const DATE = new Date()

const RECORD = {
  // ['text.世界=t&ERROR[abc]']: 'こんにちは 世界',
  ['text.$sekai']: 'こんにちは 世界',
  null: {
    nil: null,
    nilStr: 'null',
  },
  bool: [
    {
      yes: true,
      yesStr: 'true',
    },
    {
      no: false,
      noStr: 'false', 
    },
  ],
  date: {
    now: new Date(),
    nowStr: '' + new Date().toISOString() + '',
  },
  number: {
    int: [2313, 0xff],
    float: {
      pi: 3.14,
      e: -1.7,
    },
    nan: [NaN, 'NaN', 'NAN'],
    infinity: [Infinity, -Infinity, 'Infinity', '-INFINITY'],
  },
  regexp: [/^hi$/i, '/^hi$/i'],
}

test('JSON Date Serialization', () => {
  let s = JSONStringify(DATE)
  let o = JSONParse(s) as Date

  debug(s)
  
  expect(DATE.getTime()).toEqual(o.getTime())
})

test('JSON Record Serialization', () => {
  // const data = { o: range(100).map(() => RECORD)}
  const data = RECORD

  let s = JSONStringify(data)
  let o = JSONParse(s)

  debug(s)
  
  expect(deepEqual(o, data, {
    strict: true,
  })).toBeTruthy()
})

test('Query Record Serialization', () => {
  let s = QueryStringify(RECORD)
  let o = QueryParse(s)

  debug(s)
  debug(decodeURIComponent(s))
  
  expect(deepEqual(o, RECORD, {
    strict: true,
  })).toBeTruthy()
})