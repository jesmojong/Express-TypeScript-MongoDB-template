let { PORT } = process.env

export const env_variables: { PORT: number } = {
	PORT: PORT ? parseInt(PORT) : 8080
}