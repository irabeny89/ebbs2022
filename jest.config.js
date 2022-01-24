const nextJest = require("next/jest"),

  createJestConfig = nextJest({
    dir: "./"
  })

module.exports = createJestConfig({
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    // Path alias
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
    '^@/models/(.*)$': '<rootDir>/models/$1',
    '^@/graphql/(.*)$': '<rootDir>/graphql/$1',
    '^@/styles/(.*)$': '<rootDir>/styles/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1'
  }
})