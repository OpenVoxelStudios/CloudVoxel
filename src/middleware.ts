import { auth } from "@/auth"

export default auth((req) => {
    if (!req.auth && req.nextUrl.pathname !== "/login" && (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/file'))) {
        const newUrl = new URL("/login", req.nextUrl.origin)
        return Response.redirect(newUrl)
    }

    else if (!req.auth && req.nextUrl.pathname.startsWith('/api/dashboard')) {
        return new Response("Unauthorized", { status: 401 })
    }
})