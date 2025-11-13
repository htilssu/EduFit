"use client";

import { useState, useCallback } from "react";
import { Button } from "@mantine/core";
import { IconBug } from "@tabler/icons-react";
import BugReportModal from "./BugReportModal";
import html2canvas from "html2canvas";

export default function BugReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = useCallback(async () => {
    setIsCapturing(true);

    try {
      // ================================
      // 1️⃣ Chờ toàn bộ font + ảnh load
      // ================================
      // Font
      if ((document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }

      // Ảnh (bao gồm cả background-image)
      const loadImage = (src: string) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = img.onerror = () => resolve();
          img.src = src;
        });

      // Tìm ảnh từ <img> tag
      const imgElements = Array.from(document.images);
      const imgPromises = imgElements.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve();
            img.onload = img.onerror = () => resolve();
          }),
      );

      // Tìm ảnh từ background CSS
      const bgUrls = Array.from(document.querySelectorAll<HTMLElement>("*"))
        .map((el) => getComputedStyle(el).backgroundImage)
        .filter((bg) => bg && bg !== "none")
        .map((bg) => {
          const match = bg.match(/url\(["']?(.+?)["']?\)/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];

      const bgPromises = bgUrls.map(loadImage);

      // Chờ toàn bộ ảnh load xong
      await Promise.all([...imgPromises, ...bgPromises]);

      // ================================
      // 2️⃣ Chờ thêm chút cho DOM ổn định
      // ================================
      await new Promise((r) => setTimeout(r, 200));

      // ================================
      // 3️⃣ Chụp màn hình thật (viewport)
      // ================================
      const canvas = await html2canvas(document.documentElement, {
        useCORS: true,
        allowTaint: true,
        scale: window.devicePixelRatio || 2,
        backgroundColor:
          getComputedStyle(document.body).backgroundColor || "#ffffff",
        foreignObjectRendering: true,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        logging: false,

        ignoreElements: (el) => {
          const style = window.getComputedStyle(el);
          return (
            style.visibility === "hidden" ||
            style.display === "none" ||
            style.opacity === "0"
          );
        },

        onclone: (docClone) => {
          // Dọn màu CSS không tương thích
          const unsupported = ["oklab", "oklch", "lab", "lch", "color("];
          docClone.querySelectorAll("*").forEach((el: any) => {
            try {
              const s = window.getComputedStyle(el);
              const bg = s.backgroundColor || "";
              const color = s.color || "";
              const border = s.borderColor || "";

              if (unsupported.some((u) => bg.includes(u)))
                el.style.backgroundColor = "rgba(255,255,255,0)";
              if (unsupported.some((u) => color.includes(u)))
                el.style.color = "#000000";
              if (unsupported.some((u) => border.includes(u)))
                el.style.borderColor = "transparent";
            } catch {}
          });
        },
      });

      // ================================
      // 4️⃣ Cắt ảnh theo viewport thật
      // ================================
      const w = window.innerWidth;
      const h = window.innerHeight;
      const outputCanvas = document.createElement("canvas");
      const ctx = outputCanvas.getContext("2d")!;
      outputCanvas.width = w * window.devicePixelRatio;
      outputCanvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.drawImage(canvas, 0, 0, w, h, 0, 0, w, h);

      const imageData = outputCanvas.toDataURL("image/png", 0.95);
      setScreenshot(imageData);
      setIsOpen(true);
    } catch (err) {
      console.error("❌ Lỗi chụp màn hình:", err);
      setIsOpen(true);
    } finally {
      setIsCapturing(false);
    }
  }, []);
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setScreenshot(null); // Reset screenshot when closing
  }, []);

  return (
    <>
      <Button
        onClick={handleCapture}
        size="lg"
        radius="xl"
        leftSection={<IconBug size={20} />}
        color="red"
        variant="filled"
        loading={isCapturing}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 9999,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        }}
      >
        Report Bug
      </Button>

      <BugReportModal
        isOpen={isOpen}
        onClose={handleClose}
        initialScreenshot={screenshot}
      />
    </>
  );
}
