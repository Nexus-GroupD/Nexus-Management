/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",

  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },

  moduleFileExtensions: ["ts", "tsx", "js"],

  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.test.tsx"
  ],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};