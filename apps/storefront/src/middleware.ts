import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
