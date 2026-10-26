import { describe, expect, it } from "vitest";
import type { UlularEvent } from "../constants";
import { isUpcomingEvent, splitEventsByDate } from "../events-store";

const SAMPLE_EVENTS: UlularEvent[] = [
  {
    id: "past-1",
    title: "toquín pasado",
    date: "2025-01-10",
    time: "20:00",
    venue: "Ulular Napule Pizza",
    tag: "EN VIVO",
  },
  {
    id: "future-1",
    title: "toquín futuro cercano",
    date: "2027-05-15",
    time: "20:00",
    venue: "Ulular Sala de Ensayo",
    tag: "SESIÓN",
  },
  {
    id: "future-2",
    title: "toquín futuro lejano",
    date: "2027-08-20",
    time: "21:00",
    venue: "Ulular Napule Pizza",
    tag: "PIZZA & RUIDO",
  },
];

describe("events-store automatic date classification", () => {
  it("moves an event from upcoming to past once its date/time has passed", () => {
    const beforeEvent = new Date("2025-01-10T18:00:00-06:00").getTime();
    const afterEvent = new Date("2025-01-11T01:00:00-06:00").getTime();

    expect(isUpcomingEvent(SAMPLE_EVENTS[0]!, beforeEvent)).toBe(true);
    expect(isUpcomingEvent(SAMPLE_EVENTS[0]!, afterEvent)).toBe(false);
  });

  it("splits and orders upcoming (chronological) and past (reverse chronological) events", () => {
    const refNow = new Date("2026-10-23T12:00:00-06:00").getTime();
    const { upcoming, past } = splitEventsByDate(SAMPLE_EVENTS, refNow);

    expect(upcoming.map((e) => e.id)).toEqual(["future-1", "future-2"]);
    expect(past.map((e) => e.id)).toEqual(["past-1"]);
  });
});
