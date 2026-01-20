/**
 * Jest Configuration for Feature Flag UI
 * 
 * Note: This is a template configuration. After running `ng new`, 
 * you may need to install additional dependencies:
 * 
 * npm install --save-dev jest @types/jest jest-preset-angular @testing-library/angular @testing-library/jest-dom
 */

module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/e2e/'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/environments/',
    '.*.mock.ts$',
    '.*.module.ts$',
    '<rootDir>/src/main.ts'
  ],
  coverageReporters: ['html', 'text', 'text-summary', 'lcov', 'cobertura'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '.',
      outputName: 'junit.xml'
    }]
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@app/(.*)$': '<rootDir>/src/app/$1',
    '^@core/(.*)$': '<rootDir>/src/app/core/$1',
    '^@shared/(.*)$': '<rootDir>/src/app/shared/$1',
    '^@features/(.*)$': '<rootDir>/src/app/features/$1',
    '^@environments/(.*)$': '<rootDir>/src/environments/$1'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@angular|rxjs|@ngrx|lodash-es)/)'
  ],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.routes.ts',
    '!src/app/**/index.ts'
  ],
  testMatch: [
    '<rootDir>/src/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$'
      }
    ]
  }
};
