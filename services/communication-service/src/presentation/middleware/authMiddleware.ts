import { Request, Response, NextFunction } from "express";
import { IJwtPayload } from "workbee-common";


export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    if (req.originalUrl.startsWith('/socket.io')) {
        return next();
    }

    const userId = req.headers["x-user-id"];
    const email = req.headers["x-user-email"];
    const role = req.headers["x-user-role"];


    if (!userId || !role) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized request"
        });
    }


    req.user = {
        id: userId as string,
        userId: userId as string,
        email: email as string,
        role: role as IJwtPayload["role"]
    };


    next();
};