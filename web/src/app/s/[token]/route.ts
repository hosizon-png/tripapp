import { NextResponse } from "next/server";
import { findTripByShareToken, findTripItems, findTripExpenses } from "@/lib/db-helpers";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const trip = findTripByShareToken(token);
  if (!trip) return NextResponse.json({ error: "行程不存在或已取消分享" }, { status: 404 });

  const items = findTripItems(trip.id).map((i: any) => ({
    dayNumber: i.dayNumber, type: i.type, title: i.title, startTime: i.startTime,
    endTime: i.endTime, locationName: i.locationName, notes: i.notes,
  }));
  return NextResponse.json({
    trip: { title: trip.title, description: trip.description, destination: trip.destination,
      coverImage: trip.coverImage, startDate: trip.startDate, endDate: trip.endDate,
      items, expenses: findTripExpenses(trip.id),
    },
  });
}
