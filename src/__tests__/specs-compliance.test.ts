/**
 * Specs Compliance Tests
 *
 * Validates conversion logic against:
 * - POSIX IEEE Std 1003.1: https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html
 * - Quartz Scheduler Tutorials: https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html
 */

import { CronConverterU2Q as converter } from "../index";

describe("Specs Compliance: Unix to Quartz", () => {
  test("Every minute: * * * * * → 0 * * * * ? *", () => {
    expect(converter.unixToQuartz("* * * * *")).toBe("0 * * * * ? *");
  });

  test("Midnight on 1st of every month: 0 0 1 * * → 0 0 0 1 * ? *", () => {
    expect(converter.unixToQuartz("0 0 1 * *")).toBe("0 0 0 1 * ? *");
  });

  test("Step values - every 15 minutes: */15 * * * * → 0 */15 * * * ? *", () => {
    expect(converter.unixToQuartz("*/15 * * * *")).toBe("0 */15 * * * ? *");
  });

  test("Field count: Unix input must be 5 fields", () => {
    expect(() => converter.unixToQuartz("* * * *")).toThrow();
    expect(() => converter.unixToQuartz("* * * * * * * *")).toThrow();
  });

  test("Quartz output contains exactly one ? (DOM=*, DOW=*)", () => {
    const result = converter.unixToQuartz("* * * * *");
    const questionMarks = result.split(" ").filter((f) => f === "?").length;
    expect(questionMarks).toBe(1);
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

  test("DOW=? when both DOM and DOW are wildcard", () => {
    const result = converter.unixToQuartz("0 12 * * *");
    const fields = result.split(" ");
    // fields: [sec, min, hour, dom, month, dow, year]
    expect(fields[3]).toBe("*"); // DOM stays *
    expect(fields[5]).toBe("?"); // DOW becomes ?
  });

  test("DOM=? when DOW is specific", () => {
    const result = converter.unixToQuartz("0 12 * * 5");
    const fields = result.split(" ");
    expect(fields[3]).toBe("?"); // DOM becomes ?
    expect(fields[5]).toBe("5"); // DOW stays as provided
  });

  test("L (Last) in DOW is preserved", () => {
    expect(converter.unixToQuartz("0 0 * * 5L")).toBe("0 0 0 ? * 5L *");
  });

  test("# (Nth day) in DOW is preserved", () => {
    expect(converter.unixToQuartz("0 0 * * 3#2")).toBe("0 0 0 ? * 3#2 *");
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
    expect(converter.quartzToUnix("0 * * * * ? *")).toBe("* * * * *");
  });

  test("6-field Quartz is accepted", () => {
    expect(converter.quartzToUnix("0 * * * * ?")).toBe("* * * * *");
  });
});
