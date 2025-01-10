import { auth } from "@/auth";
import config from "../config";

// TODO: rate limiter
export default auth(async (req) => {
    if (req.auth && req.nextUrl.pathname === "/login") {
        const newUrl = new URL("/dashboard", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }

    else if (!req.auth && req.nextUrl.pathname !== "/login" && (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/file'))) {
        const newUrl = new URL("/login", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }

    // No API endpoints
    else if (!req.auth && req.nextUrl.pathname.startsWith('/api/partitions')) {
        return new Response("Unauthorized", { status: 401 })
    }

    else if (!req.auth && !(config.enableAPI && req.headers.get('Authorization')) && req.nextUrl.pathname.startsWith('/api/') && !req.nextUrl.pathname.startsWith("/api/auth") && !req.nextUrl.pathname.startsWith('/api/share/')) {
        return new Response("Unauthorized", { status: 401 })
    }
})