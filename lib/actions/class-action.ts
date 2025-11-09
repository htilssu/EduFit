"use server";

import { cacheLife } from "next/dist/server/use-cache/cache-life";
import { prisma } from "@/lib/prisma";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { info } from "@/lib/utils/logging";

async function classCacheFunction(year: string, semester: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`class-${year}-${semester}`);

  const classes = await prisma.class.findMany({
    where: {
      yearStudyId: year,
      semesterId: semester,
    },
    include: {
      Subject: true,
      Lecturer: true,
    },
  });
  info(`Fetching classes for year: ${year}, semester: ${semester}`);
  info(classes);
  return classes;
}

export async function getClass(timelineId: string) {
  const timeline = await prisma.timeLine.findFirst({
    where: {
      id: timelineId,
    },
  });
  if (!timeline || !timeline.yearStudyId || !timeline.semesterId) {
    return [];
  }

  return classCacheFunction(timeline.yearStudyId, timeline.semesterId);
}
