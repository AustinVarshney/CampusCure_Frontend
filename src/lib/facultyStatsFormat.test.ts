/**
 * CC-26: how withheld and real figures are displayed.
 */
import { describe, expect, it, vi } from "vitest";

vi.mock("@/api/auth", () => ({ api: {} }));

const { formatHours, formatRate } = await import("@/api/facultyStats");

describe("formatHours", () => {
  it("shows a dash for a withheld figure, never 0", () => {
    expect(formatHours(null)).toBe("—");
    expect(formatHours(undefined)).toBe("—");
  });

  it("picks a readable unit", () => {
    expect(formatHours(0.25)).toBe("15 min");
    expect(formatHours(0)).toBe("1 min");
    expect(formatHours(6.54)).toBe("6.5 h");
    expect(formatHours(72)).toBe("3 days");
  });
});

describe("formatRate", () => {
  it("formats a share as a percentage, or a dash when withheld", () => {
    expect(formatRate(0.75)).toBe("75%");
    expect(formatRate(null)).toBe("—");
  });
});
