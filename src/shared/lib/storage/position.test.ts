import { describe, expect, it } from "vitest";
import {
  calculatePosition,
  needsReindex,
  POSITION_GAP,
  reindexPositions,
} from "@/shared/lib/storage/position";

describe("calculatePosition", () => {
  it("returns POSITION_GAP when no neighbors provided", () => {
    expect(calculatePosition()).toBe(POSITION_GAP);
  });

  it("appends after the only item (only before given)", () => {
    expect(calculatePosition(3000, undefined)).toBe(3000 + POSITION_GAP);
  });

  it("prepends before the only item (only after given)", () => {
    expect(calculatePosition(undefined, 2000)).toBe(1000);
  });

  it("returns midpoint when placed between two positions", () => {
    expect(calculatePosition(1000, 3000)).toBe(2000);
  });

  it("handles fractional midpoint between adjacent positions", () => {
    expect(calculatePosition(1000, 1001)).toBe(1000.5);
  });

  it("prepends when after is POSITION_GAP", () => {
    expect(calculatePosition(undefined, POSITION_GAP)).toBe(POSITION_GAP / 2);
  });
});

describe("needsReindex", () => {
  it("returns false for well-spaced positions", () => {
    expect(needsReindex([1000, 2000, 3000])).toBe(false);
  });

  it("returns false for a single item", () => {
    expect(needsReindex([1000])).toBe(false);
  });

  it("returns false for an empty array", () => {
    expect(needsReindex([])).toBe(false);
  });

  it("returns true when gap between adjacent positions < MIN_GAP", () => {
    expect(needsReindex([1000, 1000.4, 2000])).toBe(true);
  });

  it("returns true when two positions are equal", () => {
    expect(needsReindex([1000, 1000])).toBe(true);
  });

  it("returns false when gap is exactly MIN_GAP (1)", () => {
    expect(needsReindex([1000, 1001])).toBe(false);
  });
});

describe("reindexPositions", () => {
  it("resets positions to even POSITION_GAP spacing", () => {
    const items = [
      { id: "a", position: 1000 },
      { id: "b", position: 1000.3 },
      { id: "c", position: 2000 },
    ];
    const result = reindexPositions(items);
    expect(result.map((r) => r.position)).toEqual([1000, 2000, 3000]);
  });

  it("preserves the order of items", () => {
    const items = [
      { id: "x", position: 500 },
      { id: "y", position: 1500 },
      { id: "z", position: 2500 },
    ];
    const result = reindexPositions(items);
    expect(result.map((r) => r.id)).toEqual(["x", "y", "z"]);
  });

  it("handles an empty array", () => {
    expect(reindexPositions([])).toEqual([]);
  });

  it("handles a single item", () => {
    const items = [{ id: "solo", position: 999 }];
    const result = reindexPositions(items);
    expect(result).toEqual([{ id: "solo", position: 1000 }]);
  });

  it("does not mutate the original array", () => {
    const items = [{ id: "a", position: 1000 }];
    const result = reindexPositions(items);
    expect(result).not.toBe(items);
    expect(items[0]?.position).toBe(1000);
  });
});
