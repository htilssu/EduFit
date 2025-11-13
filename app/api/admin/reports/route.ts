import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ReportStatus | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.report.count({ where }),
    ]);

    return NextResponse.json({
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reportId, status } = body;

    if (!reportId || !status) {
      return NextResponse.json(
        { error: "Report ID and status are required" },
        { status: 400 }
      );
    }

    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
