import {withAuth} from 'next-auth/middleware';

export default withAuth(
    function middleware(req) {
        const {pathname} = req.nextUrl;
        const token = req.nextauth.token;

        if (pathname.startsWith('/admin') && token?.role !== 'admin') {
            return Response.redirect(new URL('/dashboard', req.url));
        }

        if (pathname.startsWith('/dashboard') && !token) {
            return Response.redirect(new URL('/auth/signin', req.url));
        }
    },
    {
        callbacks: {
            authorized: ({token}) => !!token
        }
    }
);

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*']
};
