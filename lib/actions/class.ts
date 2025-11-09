"use server";

import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { prisma } from "@/lib/prisma";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

async function classCacheFunction(year: string, semester: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`class-${year}-${semester}`);

  return prisma.class.findMany({
    where: {
      yearStudyId: year,
      semesterId: semester,
    },
    include: {
      Subject: true,
      Lecturer: true,
    },
  });
}

export async function getClass(timelineId: string) {
  const timeline = await prisma.timeLine.findUnique({
    where: {
      id: timelineId,
    },
    select: {
      yearStudyYear: true,
      semesterSemester: true,
    },
  });

  if (!timeline || !timeline.yearStudyYear || !timeline.semesterSemester) {
    return [];
  }

  return classCacheFunction(timeline.yearStudyYear, timeline.semesterSemester);
}
