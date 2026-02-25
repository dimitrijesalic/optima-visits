import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  clearMocks: true,
  collectCoverageFrom: [
    'auth.ts',
    'src/lib/**/*.ts',
    'src/app/api/**/*.ts',
    '!src/app/api/auth/[...nextauth]/route.ts',
  ],
}

export default createJestConfig(config)
