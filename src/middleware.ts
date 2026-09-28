import { auth } from "@/auth";
import { NextResponse } from "next-auth/middleware";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;

  // Rotas protegidas começam com /app (dashboard)
  const isProtectedRoute = nextUrl.pathname.startsWith("/app");

  if (isProtectedRoute && !isAuthenticated) {
    // Redireciona para login se tentar acessar rota protegida sem estar logado
    const redirectUrl = new URL("/login", nextUrl.origin);
    redirectUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Se estiver logado e tentar acessar /login, redireciona para o dashboard
  if (nextUrl.pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/app/backlog", nextUrl.origin));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
