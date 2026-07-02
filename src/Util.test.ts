import { describe, expect, it } from "vitest";
import {
  hasNontrivialOverlap,
  computeOverlapHours,
  colorToRGB,
  rgbToColor,
  dateAtLocalMidnight,
  relativeLuminance,
  computeCellColor,
} from "./Util";

describe("hasNontrivialOverlap", () => {
  it("positive case 1", () => {
    const start1 = new Date("2025-09-22T08:00:00");
    const end1 = new Date("2025-09-22T10:00:00");
    const start2 = new Date("2025-09-22T09:00:00");
    const end2 = new Date("2025-09-22T12:00:00");
    expect(hasNontrivialOverlap(start1, end1, start2, end2)).toEqual(true);
  });

  it("positive case 2", () => {
    const start1 = new Date("2025-09-22T12:00:00");
    const end1 = new Date("2025-09-22T16:00:00");
    const start2 = new Date("2025-09-22T09:00:00");
    const end2 = new Date("2025-09-22T20:00:00");
    expect(hasNontrivialOverlap(start1, end1, start2, end2)).toEqual(true);
  });

  it("positive case 3", () => {
    const start1 = new Date("2025-09-22T12:00:00");
    const end1 = new Date("2025-09-22T14:00:00");
    const start2 = new Date("2025-09-21T23:00:00");
    const end2 = new Date("2025-09-22T12:00:01");
    expect(hasNontrivialOverlap(start1, end1, start2, end2)).toEqual(true);
  });

  it("negative case 1", () => {
    const start1 = new Date("2025-09-22T08:00:00");
    const end1 = new Date("2025-09-22T10:00:00");
    const start2 = new Date("2025-09-22T11:00:00");
    const end2 = new Date("2025-09-22T12:00:00");
    expect(hasNontrivialOverlap(start1, end1, start2, end2)).toEqual(false);
  });

  it("negative case 2", () => {
    const start1 = new Date("2025-09-22T08:00:00");
    const end1 = new Date("2025-09-22T10:00:00");
    const start2 = new Date("2025-09-22T10:00:00");
    const end2 = new Date("2025-09-22T12:00:00");
    expect(hasNontrivialOverlap(start1, end1, start2, end2)).toEqual(false);
  });
});

describe("computeOverlapHours", () => {
  it("has overlap 1", () => {
    const start1 = new Date("2025-09-22T08:00:00");
    const end1 = new Date("2025-09-22T10:00:00");
    const start2 = new Date("2025-09-22T09:00:00");
    const end2 = new Date("2025-09-22T12:00:00");
    expect(computeOverlapHours(start1, end1, start2, end2)).toEqual(1);
  });

  it("has overlap 2", () => {
    const start1 = new Date("2025-09-22T12:00:00");
    const end1 = new Date("2025-09-22T16:00:00");
    const start2 = new Date("2025-09-22T09:00:00");
    const end2 = new Date("2025-09-22T20:00:00");
    expect(computeOverlapHours(start1, end1, start2, end2)).toEqual(4);
  });

  it("has overlap 3", () => {
    const start1 = new Date("2025-09-21T08:00:00");
    const end1 = new Date("2025-09-22T20:00:00");
    const start2 = new Date("2025-09-21T20:00:00");
    const end2 = new Date("2025-09-22T08:30:00");
    expect(computeOverlapHours(start1, end1, start2, end2)).toEqual(12.5);
  });

  it("has overlap 4", () => {
    const start1 = new Date("2025-09-22T12:00:00");
    const end1 = new Date("2025-09-22T14:00:00");
    const start2 = new Date("2025-09-21T23:00:00");
    const end2 = new Date("2025-09-22T12:00:01");
    expect(computeOverlapHours(start1, end1, start2, end2)).toEqual(1 / 3600);
  });

  it("no overlap 1", () => {
    const start1 = new Date("2025-09-22T08:00:00");
    const end1 = new Date("2025-09-22T10:00:00");
    const start2 = new Date("2025-09-22T11:00:00");
    const end2 = new Date("2025-09-22T12:00:00");
    expect(computeOverlapHours(start1, end1, start2, end2)).toEqual(0);
  });

  it("no overlap 2", () => {
    const start1 = new Date("2025-09-22T08:00:00");
    const end1 = new Date("2025-09-22T10:00:00");
    const start2 = new Date("2025-09-22T10:00:00");
    const end2 = new Date("2025-09-22T12:00:00");
    expect(computeOverlapHours(start1, end1, start2, end2)).toEqual(0);
  });
});

describe("colorToRGB", () => {
  it("positive cases", () => {
    expect(colorToRGB("#000000")).toEqual([0, 0, 0]);
    expect(colorToRGB("#010203")).toEqual([1, 2, 3]);
    expect(colorToRGB("#ffffff")).toEqual([255, 255, 255]);
    expect(colorToRGB("#123456")).toEqual([18, 52, 86]);
    expect(colorToRGB("#a0b0c0")).toEqual([160, 176, 192]);
    expect(colorToRGB("#ff6600")).toEqual([255, 102, 0]);
  });

  it("negative cases", () => {
    expect(() => colorToRGB("#123")).toThrowError(new Error("Color is not in the format #RRGGBB"));
    expect(() => colorToRGB("foo")).toThrowError(new Error("Color is not in the format #RRGGBB"));
    expect(() => colorToRGB("123456")).toThrowError(
      new Error("Color is not in the format #RRGGBB"),
    );
    expect(() => colorToRGB("#1234567")).toThrowError(
      new Error("Color is not in the format #RRGGBB"),
    );
    expect(() => colorToRGB("#abcdeg")).toThrowError(
      new Error("Color is not in the format #RRGGBB"),
    );
  });
});

describe("rgbToColor", () => {
  it("positive cases", () => {
    expect(rgbToColor(0, 0, 0)).toEqual("#000000");
    expect(rgbToColor(1, 2, 3)).toEqual("#010203");
    expect(rgbToColor(255, 255, 255)).toEqual("#ffffff");
    expect(rgbToColor(10, 20, 30)).toEqual("#0a141e");
    expect(rgbToColor(255, 102, 0)).toEqual("#ff6600");
  });

  it("negative cases", () => {
    expect(() => rgbToColor(-1, 0, 0)).toThrowError(
      new Error("Number is out of range of 2-digit hexes"),
    );
    expect(() => rgbToColor(256, 0, 0)).toThrowError(
      new Error("Number is out of range of 2-digit hexes"),
    );
    expect(() => rgbToColor(12, 34, 256)).toThrowError(
      new Error("Number is out of range of 2-digit hexes"),
    );
  });
});

describe("dateAtLocalMidnight", () => {
  it("positive cases", () => {
    expect(dateAtLocalMidnight("2026-01-02")).toEqual(new Date(2026, 0, 2, 0, 0, 0, 0));
    expect(dateAtLocalMidnight("2025-12-31")).toEqual(new Date(2025, 11, 31, 0, 0, 0, 0));
  });

  it("negative cases", () => {
    expect(() => dateAtLocalMidnight("01-02-2026")).toThrowError(
      new Error("Unexpected date format"),
    );
    expect(() => dateAtLocalMidnight("2026/01/02")).toThrowError(
      new Error("Unexpected date format"),
    );
    expect(() => dateAtLocalMidnight("01/02/2026")).toThrowError(
      new Error("Unexpected date format"),
    );
  });
});

describe("relativeLuminanceSanity", () => {
  it("relative luminance of white is 1", () => {
    expect(relativeLuminance("#ffffff")).toEqual(1);
  });

  it("relative luminance of black is 0", () => {
    expect(relativeLuminance("#000000")).toEqual(0);
  });

  it("relative luminance of red is 0.2126", () => {
    expect(relativeLuminance("#ff0000")).toEqual(0.2126);
  });

  it("relative luminance of green is 0.7152", () => {
    expect(relativeLuminance("#00ff00")).toEqual(0.7152);
  });

  it("relative luminance of blue is 0.0722", () => {
    expect(relativeLuminance("#0000ff")).toEqual(0.0722);
  });
});

describe("computeCellColor", () => {
  it("returns white for zero hours", () => {
    expect(computeCellColor(0, 8, "#2f80ed")).toEqual("#ffffff");
  });

  it("uses the base color at max hours", () => {
    expect(computeCellColor(8, 8, "#2f80ed")).toEqual("#2f80ed");
  });

  it("uses a minimum intensity for nonzero low-hour cells", () => {
    expect(computeCellColor(1, 8, "#000000")).toEqual("#bfbfbf");
  });

  it("scales intermediate cells by hours relative to max hours", () => {
    expect(computeCellColor(4, 8, "#000000")).toEqual("#7f7f7f");
  });
});
