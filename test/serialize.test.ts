import deepEqual from 'deep-equal'
import { range } from 'lodash'
import { JSONParse, JSONStringify, QueryParse, QueryStringify } from '../src'

const debug = require('debug')('cinphon:serialize')

const DATE = new Date()

const RECORD = {
  string: 'こんにちは 世界',
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
    float: {
      pi: 3.14,
    },
    nan: NaN,
    nanStr: 'NaN',
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
  
  expect(deepEqual(o, RECORD, {
    strict: true,
  })).toBeTruthy()
})