module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: '/Users/aboulmane/Dropbox/@express.ts/container/tsconfig.json',
    },
  },
  moduleFileExtensions: [
    'js',
    'ts',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: [
    '**/test/**/*.spec.(ts|js)',
  ],
  testEnvironment: 'node',
  preset: 'ts-jest',
}
