const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test environment
  testEnvironment: 'jest-environment-jsdom',

  // Module name mapper for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],

  // Ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],

  // Transformar lucide-react (distribuye solo ESM)
  transformIgnorePatterns: [
    '/node_modules/(?!(lucide-react)/)',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
// Se usa una función async para poder fusionar transformIgnorePatterns con el valor que genera next/jest
const jestConfigWithNext = createJestConfig(customJestConfig);

module.exports = async () => {
  const config = await jestConfigWithNext();
  // next/jest pone su propio transformIgnorePatterns; lo reemplazamos para incluir lucide-react
  config.transformIgnorePatterns = [
    '/node_modules/(?!(lucide-react)/)',
  ];
  return config;
};
