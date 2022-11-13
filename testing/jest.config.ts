/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  globalSetup: '<rootDir>/jest.global.ts',
  clearMocks: true,
  roots: ['<rootDir>/tests'],
  testEnvironment: 'node',
  preset: 'ts-jest',
  globalTeardown: '<rootDir>/teardown.ts',
  coveragePathIgnorePatterns: ['/node_modules/'],
  verbose: true
}
