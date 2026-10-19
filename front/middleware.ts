import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PRIVATE   = ["/carrito", "/pedidos", "/cuenta", "/pedido-confirmado", "/vendedor"];
const AUTH_ONLY = ["/login"]; // redirige al catálogo si ya está logueado
const BLOCKED   = ["/registro"]; // registro libre deshabilitado — siempre → /login

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  if (BLOCKED.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (PRIVATE.some((r) => pathname.startsWith(r))) {
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (AUTH_ONLY.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/catalogo", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public|images).*)"],
};
