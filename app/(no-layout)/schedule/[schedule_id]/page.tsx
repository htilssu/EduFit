import { getClass } from "@/lib/actions/class-action";
import { auth } from "@/lib/auth";
import { getTimeLine } from "@/lib/service/timeline";
import { Metadata } from "next";
import { notFound, unauthorized } from "next/navigation";
import ScheduleMain from "../components/ScheduleMain";

export const metadata: Metadata = {
  title: "Chi tiết lịch học HUFLIT | Quản lý thời khóa biểu chi tiết 2025",
  description:
    "Xem chi tiết lịch học HUFLIT với đầy đủ thông tin về thời gian, phòng học và giảng viên. Công cụ theo dõi thời khóa biểu chính xác và chi tiết nhất cho sinh viên.",
  keywords:
    "chi tiết lịch học, thời khóa biểu HUFLIT, quản lý môn học, lớp học HUFLIT, thời gian học, phòng học",
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "Chi tiết lịch học HUFLIT | Xem thời khóa biểu chi tiết",
    description:
      "Thông tin chi tiết về lịch học, lớp học và phòng học HUFLIT dành cho sinh viên.",
    type: "website",
    images: [
      {
        url: "https://xeplich.htilssu.id.vn/images/schedule-detail.png",
        width: 1200,
        height: 630,
        alt: "Chi tiết lịch học HUFLIT",
      },
    ],
  },
};

async function Page({ params }: { params: Promise<{ schedule_id: string }> }) {
  const session = await auth();
  const { schedule_id } = await params;
  try {
    const timeLine = await getTimeLine(schedule_id);

    if (!timeLine) notFound();

    if (timeLine?.userId !== session?.user?.id && !session?.user.isAdmin) {
      unauthorized();
    }

    const classes = await getClass(schedule_id);
    return <ScheduleMain classes={classes} timeLine={timeLine} />;
  } catch {
    notFound();
  }
}

export default Page;
