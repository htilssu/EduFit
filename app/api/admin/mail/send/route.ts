import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { emailId } = body;

    if (!emailId) {
      return NextResponse.json(
        { error: "Email ID is required" },
        { status: 400 }
      );
    }

    const email = await prisma.email.findUnique({
      where: { id: emailId },
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    if (email.status === "SENT") {
      return NextResponse.json(
        { error: "Email already sent" },
        { status: 400 }
      );
    }

    await prisma.email.update({
      where: { id: emailId },
      data: { status: "SENDING", sentAt: new Date() },
    });

    sendEmailAsync(emailId).catch(console.error);

    return NextResponse.json({ message: "Email is being sent" });
  } catch (error) {
    console.error("Error sending email:", error);
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
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (error) {
    console.error("Error in sendEmailAsync:", error);
    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
