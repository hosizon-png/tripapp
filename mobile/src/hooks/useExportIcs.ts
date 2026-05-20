import { useCallback } from "react";
import { Platform } from "react-native";
import { generateIcsFile } from "@/lib/ics";

interface IcsEventInput {
  title: string;
  startDate: string;
  endDate?: string;
  locationName?: string;
  description?: string;
}

export function useExportIcs() {
  return useCallback(async (tripTitle: string, _startDate: string, items: IcsEventInput[]) => {
    const events = items
      .filter((i) => i.startDate)
      .map((i) => {
        const d = new Date(i.startDate);
        const end = i.endDate ? new Date(i.endDate) : new Date(d.getTime() + 3600000);
        return { title: i.title, startDate: d, endDate: end, location: i.locationName, description: i.description };
      });

    if (events.length === 0) return;

    const ics = generateIcsFile(events, tripTitle);
    const fileName = `${tripTitle.replace(/\s+/g, "_")}.ics`;

    if (Platform.OS === "web") {
      // Download directly in browser
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Native: use expo-file-system + expo-sharing
      try {
        const FileSystem = require("expo-file-system");
        const Sharing = require("expo-sharing");
        const path = `${FileSystem.cacheDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(path, ics, {
          encoding: FileSystem.EncodingType?.UTF8 || "utf8",
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(path, { mimeType: "text/calendar", dialogTitle: "导出日历" });
        }
      } catch {
        console.log("ICS export not available on this platform");
      }
    }
  }, []);
}
