import { Request } from "express"

export const PUBLIC_ROUTES: { method: string; path: string }[] = [
    // client
    { method: "POST", path: "/auth/register" },
    { method: "POST", path: "/auth/verifyOtp" },
    { method: "POST", path: "/auth/resend-otp" },
    { method: "POST", path: "/auth/login" },
    { method: "GET", path: "/auth/verify" },
    { method: "POST", path: "/auth/google-login" },
    { method: "POST", path: "/auth/forgot-password" },
    { method: "POST", path: "/auth/reset-password/:token" },
    { method: "POST", path: "/auth/refresh-token" },

    // admin
    { method: "POST", path: "/auth/admin/login" },

    // worker
    { method: "POST", path: "/auth/worker-login" },
    { method: "POST", path: "/auth/worker-forgot-password" },
    { method: "POST", path: "/auth/worker-reset-password/:token" },
    { method: "POST", path: "/work/apply-worker" },

];


export const isPublic = (req: Request): boolean => {
    const reqSegments = req.path.split("/").filter(Boolean);

    return PUBLIC_ROUTES.some(({ method, path }) => {
        if (method !== req.method) return false;

        const routeSegments = path.split("/").filter(Boolean);
        if (routeSegments.length !== reqSegments.length) return false;

        return routeSegments.every((seg, i) =>
            seg.startsWith(":") || seg === reqSegments[i]
        );
    });
};

