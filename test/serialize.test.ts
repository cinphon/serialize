import deepEqual from 'deep-equal'
import { JSONParse, JSONStringify, QueryParse, QueryStringify } from '../src/index'

const debug = require('debug')('cinphon:serialize')

const data = {
  say: 'こんにちは 世界',
  nil: null,
  nilStr: '_null_',
  yes: true,
  yesStr: '_true_',
  no: false,
  noStr: '_false_',
  now: new Date(),
  nowStr: '_' + new Date().toISOString() + '_',
  re: /^hi$/i,
  reStr: '_/^hi$/i_',
  pi: 3.14,
  nan: NaN,
  nanStr: '_NaN_',
}

test('JSON Serialization', () => {
  let s = JSONStringify(data)
  let o = JSONParse(s)

  debug(s)
  
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