import deepEqual from 'deep-equal'
import { JSONParse, JSONStringify, QueryParse, QueryStringify } from '../src'

const debug = require('debug')('cinphon:serialize')

const data = {
  string: 'こんにちは 世界',
  null: {
    nil: null,
    nilStr: '_null_',
  },
  bool: [
    {
      yes: true,
      yesStr: '_true_',
    },
    {
      no: false,
      noStr: '_false_', 
    },
  ],
  date: {
    now: new Date(),
    nowStr: '_' + new Date().toISOString() + '_',
  },
  number: {
    float: {
      pi: 3.14,
    },
    nan: NaN,
    nanStr: '_NaN_',
  },
  regexp: [/^hi$/i, '_/^hi$/i_'],
}

test('JSON Serialization', () => {
  let s = JSONStringify(data)
  let o = JSONParse(s)

  debug(decodeURIComponent(s))
  
  expect(deepEqual(o, data, {
    strict: true,
  })).toBeTruthy()
})

test('Query Serialization', () => {
  let s = QueryStringify(data)
  let o = QueryParse(s)

  debug(s)
  
  expect(deepEqual(o, data, {
    strict: true,
  })).toBeTruthy()
})