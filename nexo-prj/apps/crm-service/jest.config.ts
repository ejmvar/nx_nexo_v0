/* eslint-disable */
export default {
  displayName: 'crm-service',
  preset: '../../../nexo-prj/jest.preset.js',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.ts'],
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/apps/crm-service',
};