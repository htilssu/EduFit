import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

/**
 * Kiểm tra quyền truy cập admin
 * @param session Session của người dùng
 * @returns true nếu có quyền admin, false nếu không
 */
function checkAdminAccess(session: any) {
  return session?.user && session.user.isAdmin;
}

export default async function proxy(req: NextRequest) {
  const session = await auth();

  if (/^\/admin/i.test(req.nextUrl.pathname)) {
    if (!checkAdminAccess(session)) {
      const url = req.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
