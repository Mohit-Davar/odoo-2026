import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || "your-secret-key"
);

async function verifyToken(token : string){
    try{
        const {payload} = await jwtVerify(token, JWT_SECRET);
        return payload;
    }catch(error){
        console.error("Token Verification Failed : ", error);
        return null;
    }
}

export async function proxy(req : NextRequest){
    const token = req.cookies.get('refreshToken')?.value;
    const {pathname} = req.nextUrl;

    // ✅ Protect dashboard - require valid token
    if(pathname.startsWith("/dashboard")){
        if(!token){
            return NextResponse.redirect(new URL("/login", req.url));
        }
        const user = await verifyToken(token);
        if(!user){
            const response = NextResponse.redirect(new URL("/login", req.url));
            response.cookies.delete("refreshToken");
            return response;
        }
        return NextResponse.next();
    }

    // ✅ If on login/signup WITH valid token → redirect to dashboard
    if((pathname === "/login" || pathname === "/signup") && token){
        const user = await verifyToken(token);
        if(user){
            // Only redirect if token is VALID
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        // ✅ If token is invalid, DELETE it and let user see login page
        const response = NextResponse.next();
        response.cookies.delete("refreshToken");
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup']
};