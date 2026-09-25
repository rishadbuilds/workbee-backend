function getEnv(name: string): string {
    const value = process.env[name]

    if (!value) {
        throw new Error(`${name} is missing`)
    }

    return value
}

function getOptionalEnv(name: string): string | undefined {
    return process.env[name] || undefined;
}

export const ENV = {
    PORT: getEnv("PORT"),
    SERVICE_NAME: getEnv("SERVICE_NAME"),
    NODE_ENV: getEnv("NODE_ENV"),
    CORS_ORIGIN: getEnv("CORS_ORIGIN"),

    // psql db url
    DATABASE_URL: getEnv("DATABASE_URL"),

    // jwt
    JWT_SECRET: getEnv("JWT_SECRET"),
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),

    // rabbitmq
    RABBITMQ_URL: getEnv("RABBITMQ_URL"),

    // logstash
    LOG_LEVEL: getEnv("LOG_LEVEL"),
    LOGSTASH_HOST: process.env.LOGSTASH_HOST,
    LOGSTASH_PORT: process.env.LOGSTASH_PORT,

    // redis
    REDIS_PASSWORD: getOptionalEnv("REDIS_PASSWORD"),
    REDIS_HOST: getEnv("REDIS_HOST"),
    REDIS_PORT: getEnv("REDIS_PORT"),

}