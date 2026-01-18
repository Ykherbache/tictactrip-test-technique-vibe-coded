module.exports = {
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.unit.spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            tsconfig: 'tsconfig.test.json',
          },
        ],
      },
    },
    {
      displayName: 'integ',
      testMatch: ['<rootDir>/src/**/*.integ.spec.ts'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      globalSetup: '<rootDir>/tests/integ/global/setup.ts',
      globalTeardown: '<rootDir>/tests/integ/global/teardown.ts',
      preset: 'ts-jest',
      testEnvironment: 'node',
      transform: {
        '^.+\\.tsx?$': [
          'ts-jest',
          {
            tsconfig: 'tsconfig.test.json',
          },
        ],
      },
      maxWorkers: 1,
    },
  ],
  setupFiles: ['reflect-metadata'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/features/**/*.ts',
    'src/shared/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.unit.spec.ts',
    '!src/**/*.integ.spec.ts',
    '!src/app.ts',
    '!src/server.ts',
    '!src/container/**/*',
    '!src/features/*/domain/adapters/secondary/**'
  ],
};
