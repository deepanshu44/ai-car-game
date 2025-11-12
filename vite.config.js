import { defineConfig } from 'vite'

export default defineConfig({
    base: '/ai-car-game/',
    define:{
	__REPO_NAME__:JSON.stringify("ai-car-game")
    }
})
