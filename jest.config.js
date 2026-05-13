// This file is used to configure jest
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    maxWorkers: 1,
    verbose: true,
    transform: {
      '^.+\\.(ts|tsx|js)$': 'ts-jest'
    },
  };
  