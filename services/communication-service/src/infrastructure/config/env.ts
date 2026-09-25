function getEnv(name: string): string {
    const value = process.env[name]

    if (!value) {
        throw new Error(`env ${name} key is missing`)
    }

    return value
}

export const ENV = {
    PORT: getEnv("PORT"),
    RABBITMQ_URL: getEnv("RABBITMQ_URL"),
    MONGO_URI: getEnv("MONGO_URI"),
    JWT_SECRET: getEnv("JWT_SECRET"),
    NODE_ENV: getEnv("NODE_ENV"),
    LOG_LEVEL: getEnv("LOG_LEVEL"),
    SERVICE_NAME: getEnv("SERVICE_NAME"),
    LOGSTASH_HOST: process.env.LOGSTASH_HOST,
    LOGSTASH_PORT: process.env.LOGSTASH_PORT,

}