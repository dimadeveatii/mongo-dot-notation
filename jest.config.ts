import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  verbose: true,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: ['**/?(*.)+(spec|test|e2e).[jt]s?(x)'],
};
export default config;
