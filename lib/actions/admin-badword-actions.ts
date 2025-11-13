"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

// Schema cho việc tạo từ cấm
const CreateBadWordSchema = z.object({
  words: z
    .array(z.string().min(1, "Từ cấm không được để trống"))
    .transform((words) => words.map((word) => word.toLowerCase().trim())),
});

// Lấy danh sách bad word (có thể dùng trực tiếp prisma trong Server Component nếu cần)
export async function getBadWordsAction() {
  try {
    const badWords = await prisma.badWord.findMany({
      orderBy: { word: "asc" },
    });
    return { success: true, badWords };
  } catch (error) {
    return { success: false, error: "Không thể lấy danh sách từ cấm" };
  }
}

// Thêm bad word mới
export async function createBadWordAction(words: string[]) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return { success: false, error: "Không có quyền truy cập." };
  }

  try {
    // Validate dữ liệu và chuyển đổi thành chữ thường
    const validatedFields = CreateBadWordSchema.safeParse({ words });

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Loại bỏ từ trùng lặp
    const uniqueWords = [...new Set(validatedFields.data.words)];

    // Kiểm tra từ đã tồn tại trong database
    const existingWords = await prisma.badWord.findMany({
      where: {
        word: {
          in: uniqueWords,
        },
      },
      select: {
        word: true,
      },
    });

    const existingWordsSet = new Set(existingWords.map((w) => w.word));
    const newWords = uniqueWords.filter((word) => !existingWordsSet.has(word));

    if (newWords.length === 0) {
      return {
        success: false,
        error: "Tất cả từ cấm đã tồn tại trong hệ thống",
      };
    }

    // Tạo nhiều từ cấm cùng lúc
    const createdBadWords = await prisma.$transaction(
      newWords.map((word) =>
        prisma.badWord.create({
          data: { word },
        }),
      ),
    );

    revalidatePath("/admin/badwords"); // Revalidate trang quản lý
    revalidateTag("bad-words", "max");
    return {
      success: true,
      badWords: createdBadWords,
      skippedCount: uniqueWords.length - newWords.length,
    };
  } catch (error) {
    console.error("Error creating bad word:", error);
    return {
      success: false,
      error: "Không thể thêm từ cấm",
    };
  }
}

// Xóa bad word
export async function deleteBadWordAction(id: string) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return { success: false, error: "Không có quyền truy cập." };
  }

  if (!id) {
    return { success: false, error: "ID không hợp lệ." };
  }

  try {
    await prisma.badWord.delete({
      where: { id },
    });
    revalidatePath("/admin/badwords"); // Revalidate trang quản lý
    revalidateTag("bad-words", "max");
    return { success: true };
  } catch (error) {
    console.error("Error deleting bad word:", error);
    return { success: false, error: "Lỗi khi xóa từ cấm." };
  }
}
