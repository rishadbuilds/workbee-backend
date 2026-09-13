function getEnv(name:string):string {
    const value = process.env[name]

    if(!value) {
        throw new Error(`${name} is missing`)
    }

    return value
}

export const ENV = {
    // jwt
    JWT_SECRET: getEnv("JWT_SECRET"),
    JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),

    //email
    EMAIL_USER: getEnv("EMAIL_USER"),
    EMAIL_PASSKEY: getEnv("EMAIL_PASSKEY"),

    // service
    PORT: getEnv("PORT"),
    SERVICE_NAME: getEnv("SERVICE_NAME"),

    // rabbitmq
    RABBITMQ_URL: getEnv("RABBITMQ_URL"),

    // logging
    LOG_LEVEL: getEnv("LOG_LEVEL"),
    NODE_ENV: getEnv("NODE_ENV"),
    LOGSTASH_HOST: getEnv("LOGSTASH_HOST"),
    LOGSTASH_PORT: getEnv("LOGSTASH_PORT"),

    // DB
    MONGO_URI: getEnv("MONGO_URI"),

    // cloudinary 
    CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
    CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
    CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),


}