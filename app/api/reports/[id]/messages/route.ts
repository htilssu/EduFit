import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: reportId } = await params;
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Check if report exists and user has access
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reportMessage = await prisma.reportMessage.create({
      data: {
        reportId,
        userId: session.user.id,
        message,
        isAdmin: session.user.role === "ADMIN",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            role: true,
          },
        },
      },
    });

    // Update report's updatedAt
    await prisma.report.update({
      where: { id: reportId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ message: reportMessage }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
