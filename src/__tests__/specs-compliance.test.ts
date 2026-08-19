/**
 * Specs Compliance Tests
 *
 * Validates conversion logic against:
 * - POSIX IEEE Std 1003.1: https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html
 * - Quartz Scheduler Tutorials: https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html
 */

import { CronConverterU2Q as converter, CronValidatorU2Q as validator } from "../index";

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

  test("Quartz output contains exactly one ? when both DOM and DOW are wildcards", () => {
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

  test("DOW becomes ? when both DOM and DOW are wildcards (Quartz requires one ?)", () => {
    const result = converter.unixToQuartz("0 12 * * *");
    const fields = result.split(" ");
    expect(fields[3]).toBe("*"); // DOM stays *
    expect(fields[5]).toBe("?"); // DOW becomes ?
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

describe("Specs Compliance: DOW ranges and steps crossing Sunday", () => {
  test("Fri-Sun (5-7) becomes 6-7,1 instead of an inverted range", () => {
    expect(converter.unixToQuartz("0 0 * * 5-7").split(" ")[5]).toBe("6-7,1");
  });

  test("Sat-Sun (6-7) becomes 7,1", () => {
    expect(converter.unixToQuartz("0 0 * * 6-7").split(" ")[5]).toBe("7,1");
  });

  test("Sun-Sat (0-7, every day) collapses to DOM=* DOW=?", () => {
    const fields = converter.unixToQuartz("0 0 * * 0-7").split(" ");
    expect(fields[3]).toBe("*");
    expect(fields[5]).toBe("?");
  });

  test("FRI-7 alias range becomes FRI-7,1", () => {
    expect(converter.unixToQuartz("0 0 * * FRI-7").split(" ")[5]).toBe("FRI-7,1");
  });

  test("degenerate range 7-7 maps to Sunday (1)", () => {
    expect(converter.unixToQuartz("0 0 * * 7-7").split(" ")[5]).toBe("1");
  });

  test("Mon/Wed/Fri/Sun step (1/2) keeps every day of the set", () => {
    // Unix 1/2 = days 1,3,5,7 (Mon, Wed, Fri, Sun) → Quartz 2,4,6,1
    expect(converter.unixToQuartz("0 0 * * 1/2").split(" ")[5]).toBe("2,4,6,1");
  });

  test("Fri-Sun step (5-7/2) keeps Fri and Sun", () => {
    expect(converter.unixToQuartz("0 0 * * 5-7/2").split(" ")[5]).toBe("6,1");
  });

  test("Sun/Tue/Thu/Sat step (*/2) is equivalent in both formats", () => {
    expect(converter.unixToQuartz("0 0 * * */2").split(" ")[5]).toBe("*/2");
  });

  test("Quartz Mon/Wed/Fri step (2/2) keeps every day of the set", () => {
    // Quartz 2/2 = days 2,4,6 (Mon, Wed, Fri) → Unix 1,3,5
    expect(converter.quartzToUnix("0 0 12 ? * 2/2").split(" ")[4]).toBe("1,3,5");
  });

  test("Quartz Sun/Tue/Thu/Sat step (*/3) is equivalent in both formats", () => {
    expect(converter.quartzToUnix("0 0 12 ? * */3").split(" ")[4]).toBe("*/3");
  });
});

describe("Specs Compliance: Quartz seconds field", () => {
  test("quartzToUnix throws when seconds are pinned to a non-zero value", () => {
    expect(() => converter.quartzToUnix("30 0 12 * * ?")).toThrow(/second/i);
  });

  test("quartzToUnix throws when seconds use a step", () => {
    expect(() => converter.quartzToUnix("*/10 0 12 * * ?")).toThrow(/second/i);
  });

  test("quartzToUnix throws when seconds are a wildcard (every second)", () => {
    expect(() => converter.quartzToUnix("* 0 12 * * ?")).toThrow(/second/i);
  });

  test("quartzToUnix accepts second=0", () => {
    expect(converter.quartzToUnix("0 0 12 * * ?")).toBe("0 12 * * *");
  });
});

describe("Specs Compliance: field range boundaries", () => {
  test("Quartz DOM step starting at 0 is rejected (days are 1-31)", () => {
    expect(validator.isValidQuartz("0 0 12 0/5 * ?")).toBe(false);
  });

  test("Quartz DOW step starting at 0 is rejected (days are 1-7)", () => {
    expect(validator.isValidQuartz("0 0 12 ? * 0/2")).toBe(false);
  });

  test("Quartz minute step starting at 0 remains valid", () => {
    expect(validator.isValidQuartz("0 0/15 12 * * ?")).toBe(true);
  });
});
