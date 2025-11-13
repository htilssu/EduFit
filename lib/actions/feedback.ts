"use server";

import { auth } from "@/lib/auth";
import { ForbiddenError } from "@/lib/exceptions/ForbiddenError";
import { prisma } from "@/lib/prisma";
import { BadWordService } from "@/lib/service/badword";
import { revalidateTag } from "next/cache";

export async function createFeedback(data: {
  content: string;
  rating: number;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để gửi đánh giá",
      };
    }

    if (!data.content || data.content.trim() === "") {
      return {
        success: false,
        error: "Nội dung đánh giá không được để trống",
      };
    }

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return {
        success: false,
        error: "Đánh giá phải có số sao từ 1 đến 5",
      };
    }

    // Kiểm tra từ cấm với cache
    const { hasBadWords, badWords } = await BadWordService.checkBadWords(
      data.content,
    );

    if (hasBadWords) {
      return {
        success: false,
        error: `Nội dung chứa từ cấm: ${badWords.join(", ")}`,
      };
    }

    const feedback = await prisma.feedback.create({
      data: {
        content: data.content,
        rating: data.rating,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    revalidateTag("feedback", "max");

    return {
      success: true,
      data: feedback,
      message: "Đã gửi đánh giá thành công",
    };
  } catch (error) {
    console.error("Error creating feedback:", error);
    return {
      success: false,
      error: "Có lỗi xảy ra khi gửi đánh giá, vui lòng thử lại sau",
    };
  }
}

/**
 * Xóa feedback dựa vào ID
 * @param id ID của feedback cần xóa
 * @returns success: true nếu xóa thành công
 * @throws ForbiddenError nếu người dùng không có quyền xóa
 */
export async function deleteFeedback(id: string) {
  const session = await auth();

  if (!session || !session.user) {
    throw new ForbiddenError("Bạn cần đăng nhập để thực hiện hành động này");
  }

  // Kiểm tra xem feedback có tồn tại và người dùng có quyền xóa không
  const feedback = await prisma.feedback.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!feedback) {
    return { success: false, message: "Feedback không tồn tại" };
  }

  // Lấy thông tin người dùng từ DB để kiểm tra quyền
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  // Kiểm tra quyền: chỉ admin hoặc chủ sở hữu feedback có thể xóa
  const isOwner = feedback.userId === session.user.id;
  const isAdmin = user?.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError("Bạn không có quyền xóa feedback này");
  }

  // Thực hiện xóa feedback
  await prisma.feedback.delete({
    where: { id },
  });

  // Revalidate cache
  revalidateTag("feedback", "max");

  return { success: true, message: "Đã xóa feedback thành công" };
}
