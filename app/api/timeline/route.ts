import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
/**
 * GET /api/timeline - Lấy danh sách timeLine của người dùng
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Người dùng chưa đăng nhập" },
        { status: 401 },
      );
    }

    const timeLines = await prisma.timeLine.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(timeLines);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách timeLine:", error);
    return NextResponse.json(
      { error: "Lỗi khi lấy danh sách lịch học" },
      { status: 500 },
    );
  }
}
