const { parse_yaml } = require('../lib/parse_yaml')
const fs = require('fs')
describe('parse yaml', () => {
  test('test yaml parsing', () => {
    expect(parse_yaml("/test/files/build.yaml")).toEqual(JSON.parse(fs.readFileSync(__dirname + "/expected/build.json", 'utf-8')))
  });
});

describe('parse yaml without builder', () => {
  test('test yaml parsing without builder', () => {
    expect(parse_yaml("/test/files/buildWithoutBuilder.yaml")).toEqual(JSON.parse(fs.readFileSync(__dirname + "/expected/buildWithoutBuilder.json", 'utf-8')))

  })
})

describe('parse yaml without type', () => {
  test('test yaml parsing without buildpack/type', () => {
    expect(parse_yaml("/test/files/buildWithoutType.yaml")).toEqual(JSON.parse(fs.readFileSync(__dirname + "/expected/buildWithoutType.json", 'utf-8')))

  })
})

describe('File not found error handling', () => {
  test('throw on file not found', () => {
    try {
      parse_yaml('/test/output.yaml')
    } catch (error) {
      expect(error.message).toBe(/Error: ENOENT: no such file or directory/)
    }
  })
})

describe('Modules not defined error handling', () => {
  test('throw on modules not defined', () => {
    try {
      parse_yaml('/test/files/withoutModules.yaml')
    } catch (error) {
      expect(error.message).toBe(/Modules not defined/)
    }
  })
})

describe('build parameter not defined error handling', () => {
  test('throw when build parameter not defined', () => {
    try {
      parse_yaml('/test/files/incorrectParameter.yaml')
    } catch (error) {
      expect(error.message).toBe(/build parameter is invalid/)
    }
  })
})
