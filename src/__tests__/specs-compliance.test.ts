/**
 * Specs Compliance Tests
 *
 * Validates conversion logic against:
 * - POSIX IEEE Std 1003.1: https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html
 * - Quartz Scheduler Tutorials: https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html
 */

import { CronConverterU2Q as converter } from "../index";

describe("Specs Compliance: Unix to Quartz", () => {
  test("Every minute: * * * * * → 0 * * * * * *", () => {
    expect(converter.unixToQuartz("* * * * *")).toBe("0 * * * * * *");
  });

  test("Midnight on 1st of every month: 0 0 1 * * → 0 0 0 1 * ? *", () => {
    expect(converter.unixToQuartz("0 0 1 * *")).toBe("0 0 0 1 * ? *");
  });

  test("Step values - every 15 minutes: */15 * * * * → 0 */15 * * * * *", () => {
    expect(converter.unixToQuartz("*/15 * * * *")).toBe("0 */15 * * * * *");
  });

  test("Field count: Unix input must be 5 fields", () => {
    expect(() => converter.unixToQuartz("* * * *")).toThrow();
    expect(() => converter.unixToQuartz("* * * * * * * *")).toThrow();
  });

  test("Quartz output contains zero ? when both DOM and DOW are *", () => {
    const result = converter.unixToQuartz("* * * * *");
    const questionMarks = result.split(" ").filter((f) => f === "?").length;
    expect(questionMarks).toBe(0);
  });

  test("Quartz output contains exactly one ? (DOM=specific, DOW=*)", () => {
    const result = converter.unixToQuartz("0 0 15 * *");
    const questionMarks = result.split(" ").filter((f) => f === "?").length;
    expect(questionMarks).toBe(1);
  });

  test("Quartz output contains exactly one ? (DOM=*, DOW=specific)", () => {
    const result = converter.unixToQuartz("0 0 * * 1");
    const questionMarks = result.split(" ").filter((f) => f === "?").length;
    expect(questionMarks).toBe(1);
  });

  test("Quartz output is 7 fields (with year)", () => {
    const result = converter.unixToQuartz("* * * * *");
    expect(result.split(" ")).toHaveLength(7);
  });

  test("Both DOM and DOW remain * when both DOM and DOW are wildcard", () => {
    const result = converter.unixToQuartz("0 12 * * *");
    const fields = result.split(" ");
    expect(fields[3]).toBe("*"); // DOM stays *
    expect(fields[5]).toBe("*"); // DOW stays *
  });

  test("DOM=? when DOW is specific", () => {
    const result = converter.unixToQuartz("0 12 * * 5");
    const fields = result.split(" ");
    expect(fields[3]).toBe("?"); // DOM becomes ?
    expect(fields[5]).toBe("6"); // Unix 5 (Fri) → Quartz 6 (Fri)
  });

  test("L (Last) in DOW in Unix is rejected as invalid", () => {
    expect(() => converter.unixToQuartz("0 0 * * 5L")).toThrow();
  });

  test("# (Nth day) in DOW in Unix is rejected as invalid", () => {
    expect(() => converter.unixToQuartz("0 0 * * 3#2")).toThrow();
  });

  test("Sunday alias: DOW=0 maps to Quartz 1 (Sunday)", () => {
    const result = converter.unixToQuartz("0 0 * * 0");
    const dow = result.split(" ")[5];
    expect(dow).toBe("1");
  });

  test("Sunday alias: DOW=7 also maps to Quartz 1 (Sunday)", () => {
    const result = converter.unixToQuartz("0 0 * * 7");
    const dow = result.split(" ")[5];
    expect(dow).toBe("1");
  });
});

describe("Specs Compliance: Quartz to Unix", () => {
  test("Field count: Quartz input must be 6 or 7 fields", () => {
    expect(() => converter.quartzToUnix("* * * * *")).toThrow();
    expect(() => converter.quartzToUnix("* * * * * * * *")).toThrow();
  });

  test("7-field Quartz (with year) is accepted", () => {
    expect(converter.quartzToUnix("0 * * * * * *")).toBe("* * * * *");
  });

  test("6-field Quartz is accepted", () => {
    expect(converter.quartzToUnix("0 * * * * *")).toBe("* * * * *");
  });

  test("Quartz 0/5 step notation converts to Unix */5", () => {
    expect(converter.quartzToUnix("0 0/5 * ? * *")).toBe("*/5 * * * *");
  });

  test("Quartz Sunday (1) maps to Unix Sunday (0)", () => {
    const result = converter.quartzToUnix("0 0 12 ? * 1");
    expect(result.split(" ")[4]).toBe("0");
  });

  test("Quartz Monday (2) maps to Unix Monday (1)", () => {
    const result = converter.quartzToUnix("0 0 12 ? * 2");
    expect(result.split(" ")[4]).toBe("1");
  });

  test("Quartz Saturday (7) maps to Unix Saturday (6)", () => {
    const result = converter.quartzToUnix("0 0 12 ? * 7");
    expect(result.split(" ")[4]).toBe("6");
  });

  test("DOW list is converted element-wise (Quartz 2,4,6 → Unix 1,3,5)", () => {
    const result = converter.quartzToUnix("0 0 0 ? * 2,4,6");
    expect(result.split(" ")[4]).toBe("1,3,5");
  });

  test("DOW range is converted element-wise (Quartz 2-6 → Unix 1-5)", () => {
    const result = converter.quartzToUnix("0 0 0 ? * 2-6");
    expect(result.split(" ")[4]).toBe("1-5");
  });

  test("Quartz Last Sunday (1L) throws error as Unix does not support L", () => {
    expect(() => converter.quartzToUnix("0 0 0 ? * 1L")).toThrow();
  });

  test("Quartz 2nd Friday (6#2) throws error as Unix does not support #", () => {
    expect(() => converter.quartzToUnix("0 0 0 ? * 6#2")).toThrow();
  });
});
