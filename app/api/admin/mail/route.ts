import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmailStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as EmailStatus | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [emails, total] = await Promise.all([
      prisma.email.findMany({
        where,
        include: {
          sentByUser: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.email.count({ where }),
    ]);

    return NextResponse.json({
      emails,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { subject, content, recipients, cc = [], bcc = [], sendNow } = body;

    if (!subject || !content || !recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const email = await prisma.email.create({
      data: {
        subject,
        content,
        recipients,
        cc,
        bcc,
        status: sendNow ? "SENDING" : "DRAFT",
        sentBy: session.user.id,
        sentAt: sendNow ? new Date() : null,
      },
      include: {
        sentByUser: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (sendNow) {
      // Send email asynchronously
      sendEmailAsync(email.id).catch(console.error);
    }

    return NextResponse.json({ email }, { status: 201 });
  } catch (error) {
    console.error("Error creating email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendEmailAsync(emailId: string) {
  try {
    const email = await prisma.email.findUnique({
      where: { id: emailId },
    });

    if (!email) return;

    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT || "587"),
      secure: process.env.MAIL_PORT === "465",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const fromName = process.env.MAIL_FROM_NAME || "EDUFIT";
    const fromAddress = process.env.MAIL_FROM || process.env.MAIL_USER;
    
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: email.recipients.join(", "),
      cc: email.cc.length > 0 ? email.cc.join(", ") : undefined,
      bcc: email.bcc.length > 0 ? email.bcc.join(", ") : undefined,
      subject: email.subject,
      html: email.content,
    });

    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
