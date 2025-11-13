import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheLife, cacheTag, unstable_cache } from "next/cache";

const getYearStudy = async () => {
  "use cache";
  cacheTag("yearStudy");
  cacheLife("days");
  return prisma.yearStudy.findMany();
};

export async function GET() {
  const year = await getYearStudy();
  return NextResponse.json(year);
}
