module.exports = {
  verbose: true,
  automock: false,
  testResultsProcessor: 'jest-sonar-reporter',
  coverageDirectory: './coverage/',
  testPathIgnorePatterns: ['node_modules'],
  collectCoverageFrom: [
    'src/**',
    '!**/node_modules/**',
    '!.github/**',
    '!__tests__/**',
  ],
};
