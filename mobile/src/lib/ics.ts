// Simple ICS calendar file generator
interface IcsEvent {
  title: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  description?: string;
}

export function generateIcsFile(events: IcsEvent[], tripTitle: string): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TripApp//Trip Planner//CN",
    `X-WR-CALNAME:${tripTitle}`,
  ];

  for (const event of events) {
    const dtStart = formatIcsDate(event.startDate);
    const dtEnd = event.endDate ? formatIcsDate(event.endDate) : dtStart;

    lines.push(
      "BEGIN:VEVENT",
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${escapeIcs(event.title)}`,
      ...(event.location ? [`LOCATION:${escapeIcs(event.location)}`] : []),
      ...(event.description ? [`DESCRIPTION:${escapeIcs(event.description)}`] : []),
      `UID:${event.startDate.getTime()}-${Math.random().toString(36).slice(2)}@tripapp`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function formatIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
}

function escapeIcs(text: string): string {
  return text.replace(/[\\;,]/g, (c) => "\\" + c).replace(/\n/g, "\\n");
}
