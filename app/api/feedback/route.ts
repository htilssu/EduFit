import { NextRequest, NextResponse } from "next/server";
import { getFeedbacks } from "@/lib/service/feedback";

export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 5;
    const page = Number(searchParams.get("page")) || 1;

    const result = await getFeedbacks(page, limit);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
