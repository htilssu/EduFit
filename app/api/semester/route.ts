import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

const getSemester = async () => {
  "use cache";
  cacheTag("semester");
  cacheLife("days");
  return prisma.semester.findMany();
};

export async function GET() {
  const data = await getSemester();

  return NextResponse.json(data);
}
