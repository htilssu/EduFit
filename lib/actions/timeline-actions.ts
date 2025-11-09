"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ClassData } from "../types";

interface TimeLineData {
  name: string;
  description?: string;
  classes: ClassData[];
  isPublic?: boolean;
  year?: string;
  semester?: string;
}

interface UpdateTimeLineData extends TimeLineData {
  id: string;
}

interface TimeLineResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Server action tạo timeLine mới
 * @param data Dữ liệu timeLine
 * @returns Kết quả thao tác
 */
export async function createTimeLine(
  data: TimeLineData,
): Promise<TimeLineResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để thực hiện hành động này",
      };
    }

    if (!data.name || data.name.trim().length === 0) {
      return {
        success: false,
        error: "Tên lịch học không được để trống",
      };
    }

    if (!data.year || !data.semester) {
      return {
        success: false,
        error: "Năm học và học kỳ không được để trống",
      };
    }

    console.log(data);

    const timeLine = await prisma.timeLine.create({
      data: {
        name: data.name,
        description: data.description || "",
        classes: [],
        isPublic: data.isPublic || false,
        userId: session.user.id,
        yearStudyId: data.year,
        semesterId: data.semester,
      },
    });

    revalidatePath("/schedule");

    return {
      success: true,
      data: timeLine,
    };
  } catch (error: any) {
    console.error("Lỗi khi tạo timeLine:", error);
    return {
      success: false,
      error: error.message || "Có lỗi xảy ra khi tạo lịch học",
    };
  }
}

/**
 * Server action cập nhật timeLine
 * @param data Dữ liệu timeLine cần cập nhật
 * @returns Kết quả thao tác
 */
export async function updateTimeLine(
  data: UpdateTimeLineData,
): Promise<TimeLineResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để thực hiện hành động này",
      };
    }

    if (!data.id) {
      return {
        success: false,
        error: "ID lịch học không được để trống",
      };
    }

    const existingTimeLine = await prisma.timeLine.findUnique({
      where: {
        id: data.id,
        userId: session.user.id,
      },
    });

    if (!existingTimeLine) {
      return {
        success: false,
        error: "Lịch học không tồn tại hoặc bạn không có quyền truy cập",
      };
    }

    const timeLine = await prisma.timeLine.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        description: data.description,
        classes: data.classes || [],
        isPublic: data.isPublic,
      },
    });

    revalidatePath("/schedule");

    return {
      success: true,
      data: timeLine,
    };
  } catch (error: any) {
    console.error("Lỗi khi cập nhật timeLine:", error);
    return {
      success: false,
      error: error.message || "Có lỗi xảy ra khi cập nhật lịch học",
    };
  }
}

/**
 * Server action xóa timeLine
 * @param id ID của timeLine cần xóa
 * @returns Kết quả thao tác
 */
export async function deleteTimeLine(id: string): Promise<TimeLineResult> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để thực hiện hành động này",
      };
    }

    const existingTimeLine = await prisma.timeLine.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingTimeLine) {
      return {
        success: false,
        error: "Lịch học không tồn tại hoặc bạn không có quyền truy cập",
      };
    }

    await prisma.timeLine.delete({
      where: {
        id,
      },
    });

    revalidatePath("/schedule");

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Lỗi khi xóa timeLine:", error);
    return {
      success: false,
      error: error.message || "Có lỗi xảy ra khi xóa lịch học",
    };
  }
}
