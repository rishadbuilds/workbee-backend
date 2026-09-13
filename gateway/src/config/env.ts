function requiredEnv(key:string):string {
    const value = process.env[key];
    if(!value) {
        throw new Error(`missing enviroment variable: ${key}`)
    }
    return value
}



export const ENV = {
    PORT:process.env.PORT,
    JWT_SECRET : requiredEnv("JWT_SECRET"),
    JWT_REFRESH_SECRET : requiredEnv("JWT_REFRESH_SECRET"),
    LOGSTASH_HOST : requiredEnv("LOGSTASH_HOST"),
    LOGSTASH_PORT : requiredEnv("LOGSTASH_PORT"),
    LOG_LEVEL : requiredEnv("LOG_LEVEL") ,
    SERVICE_NAME : requiredEnv("SERVICE_NAME"),
    NODE_ENV : requiredEnv("NODE_ENV"),
    CORS_ORIGIN : requiredEnv("CORS_ORIGIN"),
    
} as const;



export function checkEnv() {
    const missing = Object.entries(ENV)
        .filter(([,value]) => value == null)
        .map(([key]) => key);
    
    if (missing.length) {
        throw new Error(`missing environment variables: ${missing.join(", ")}`)
    }
}
