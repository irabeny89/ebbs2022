const nextJest = require("next/jest"),

createJestConfig = nextJest({
  dir: "./"
})

module.exports = createJestConfig({
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: "jest-environment-jsdom"
})