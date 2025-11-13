import React from "react";
import { Metadata } from "next";
import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BugReportButton from "./components/BugReportButton";

export const metadata: Metadata = {
  title: "Xếp lịch học HUFLIT | Trang chủ tra cứu lịch học chính thức",
  description:
    "Tra cứu lịch học HUFLIT nhanh chóng, chính xác và tiện lợi. Công cụ xếp lịch học thông minh dành riêng cho sinh viên trường Đại học Ngoại ngữ - Tin học TPHCM.",
  keywords:
    "lịch học HUFLIT, tra cứu lịch học, thời khóa biểu HUFLIT, xếp lịch học sinh viên, HUFLIT, công cụ xếp lịch học",
  authors: [
    {
      name: "HUFLIT Schedule Team",
      url: "https://xeplich.htilssu.id.vn/about",
    },
  ],
  creator: "HUFLIT Schedule Team",
  openGraph: {
    title: "Xếp lịch học HUFLIT | Trang chủ tra cứu lịch học chính thức",
    description:
      "Tra cứu lịch học HUFLIT nhanh chóng và chính xác. Công cụ xếp lịch học thông minh cho sinh viên HUFLIT.",
    images: [
      {
        url: "https://xeplich.htilssu.id.vn/images/homepage-preview.jpg",
        width: 1200,
        height: 630,
        alt: "Xếp lịch học HUFLIT Preview",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xếp lịch học HUFLIT | Trang tra cứu lịch học",
    description: "Tra cứu và quản lý lịch học HUFLIT hiệu quả",
  },
};

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MantineProvider>
      <Navbar />
      <div className="mt-16">{children}</div>
      <Footer />
      <BugReportButton />
    </MantineProvider>
  );
}
