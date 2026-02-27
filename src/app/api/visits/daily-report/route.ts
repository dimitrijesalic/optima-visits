import { NextResponse } from "next/server";

import prisma from "@/src/lib/prisma";

export async function GET(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey || apiKey !== process.env.API_KEY) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );

    const todayString = today.toISOString().split("T")[0];

    const visits = await prisma.visit.findMany({
      where: {
        plannedVisitDate: todayString,
        updatedAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
        status: { in: ["DONE", "CANCELED"] },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: [{ plannedVisitTime: "asc" }],
    });

    return NextResponse.json({ total: visits.length, data: visits });
  } catch (error: unknown) {
    console.error("Error fetching daily report:", error);

    return NextResponse.json(
      { error: "Failed to fetch daily report" },
      { status: 400 },
    );
  }
}
