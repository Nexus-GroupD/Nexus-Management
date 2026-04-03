/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterFramework: ["@testing-library/jest-dom"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js"],
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.test.tsx",
    "**/__tests__/**/*.tests.tsx"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
