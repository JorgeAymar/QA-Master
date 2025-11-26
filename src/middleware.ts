import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth-jose';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Normal authentication logic
    const protectedRoutes = ['/', '/projects', '/profile'];
    const publicRoutes = ['/login', '/signup', '/setup'];

    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route) && !publicRoutes.includes(path));
    const isPublicRoute = publicRoutes.includes(path);

    const cookie = request.cookies.get('session')?.value;
    const session = await decrypt(cookie);

    if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    if (isPublicRoute && session?.userId && path !== '/setup') {
        return NextResponse.redirect(new URL('/', request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
