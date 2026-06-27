import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.base.json',
        compilerOptions: {
          module: 'commonjs',
        },
      },
    ],
  },
  testMatch: ['**/?(*.)+(spec|test).ts'],
  modulePathIgnorePatterns: ['-e2e/'],
};

export default config;