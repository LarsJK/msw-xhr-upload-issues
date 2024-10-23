import { type UserConfig, defineConfig } from 'vitest/config'

export default defineConfig((): UserConfig => {
	return {
		test: {
			globals: true,
			environment: 'jsdom',
			clearMocks: true,
			exclude: ['**/node_modules/**'],
		},
	}
})
