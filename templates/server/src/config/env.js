import dotenv from 'dotenv'
dotenv.config()

function requireEnv(name) {
    const value = process.env[name]
    if (!value) {
        console.error(`❌ Missing required environment variable: ${name}`)
        process.exit(1)
    }
    return value
}

const rawPort = process.env.PORT || '8000'
const parsedPort = parseInt(rawPort, 10)
if (isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    console.error(`❌ Invalid PORT value: "${rawPort}". Must be a number between 1 and 65535.`)
    process.exit(1)
}

export const ENV = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parsedPort,
    mongo_uri: requireEnv('MONGO_URI'),
    corsOrigins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
        : [],
    isProduction: (process.env.NODE_ENV || 'development') === 'production',
}
