import dotenv from "dotenv";
// env config
dotenv.config();

import express from "express";

import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";
import { gatewayReqResLogger } from "./middleware/GatewayReqResLogging";
import { verifyToken } from "./middleware/AuthMiddleware";
import { logger } from "./logger/logger";
import { ENV } from "./config/env";

// gateway port
const PORT = ENV.PORT;

// create app
const app = express();

// cors origin policy
app.use(cors({
    origin: ENV.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// centerlized logging (mogran, winston)
app.use(gatewayReqResLogger);

// autherization before hitting services
app.use(verifyToken);

// services
const services = [
    {
        route: "/auth",
        target: ENV.AUTH_SERVICE
    },
    {
        route: "/work",
        target: ENV.WORK_SERVICE
    },
    {
        route:"/communication",
        target: ENV.COMMUNICATION_SERVICE
    },
    {
        route:"/notification",
        target: ENV.NOTIFICATION_SERVICE
    },
    {
        route:"/payment",
        target: ENV.PAYMENT_SERVICE
    },
];

// forward routes to services
services.forEach((service) => {
    app.use(
        `${service.route}`,
        createProxyMiddleware({
            target: service.target,
            changeOrigin: true,
        })
    );
});

// gateway port litsening
app.listen(PORT, () => logger.info(`API Gateway running on ${PORT}`));
