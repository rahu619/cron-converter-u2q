import {
  CronConverterU2Q as converter,
  CronDescriberU2Q as describer,
  getNextRuns,
  CronValidatorU2Q as validator,
} from "../index";

describe("Unix2Quartz Conversion", () => {
  test("Every minute", () => {
    const result = converter.unixToQuartz("* * * * *");
    expect(result).toBe("0 * * * * * *");
  });

  test("Every 5 minutes", () => {
    const result = converter.unixToQuartz("*/5 * * * *");
    expect(result).toBe("0 */5 * * * * *");
  });

  test("Every hour at minute 30", () => {
    const result = converter.unixToQuartz("30 * * * *");
    expect(result).toBe("0 30 * * * * *");
  });

  test("Everyday at 12pm", () => {
    const result = converter.unixToQuartz("0 12 * * *");
    expect(result).toBe("0 0 12 * * * *");
  });

  test("Every Monday at 12pm", () => {
    const result = converter.unixToQuartz("0 12 * * 1");
    expect(result).toBe("0 0 12 ? * 2 *");
  });

  test("Every 10th day of the month", () => {
    const result = converter.unixToQuartz("0 0 10 * *");
    expect(result).toBe("0 0 0 10 * ? *");
  });

  test("Every January 1st at 12am", () => {
    const result = converter.unixToQuartz("0 0 1 1 *");
    expect(result).toBe("0 0 0 1 1 ? *");
  });

  test("Every last day of the month (invalid in Unix)", () => {
    expect(() => converter.unixToQuartz("59 23 L * *")).toThrow();
  });

  test("Every day at 2:30 AM", () => {
    const result = converter.unixToQuartz("30 2 * * *");
    expect(result).toBe("0 30 2 * * * *");
  });

  test("Every Monday at 2:30 AM", () => {
    const result = converter.unixToQuartz("30 2 * * 1");
    expect(result).toBe("0 30 2 ? * 2 *");
  });

  test("Every day at 1:00 AM and 1:00 PM", () => {
    const result = converter.unixToQuartz("0 1,13 * * *");
    expect(result).toBe("0 0 1,13 * * * *");
  });

  test("Every 15 minutes", () => {
    const result = converter.unixToQuartz("*/15 * * * *");
    expect(result).toBe("0 */15 * * * * *");
  });

  test("Last Friday of every month (invalid in Unix)", () => {
    expect(() => converter.unixToQuartz("0 0 * * 5L")).toThrow();
  });

  test("Second Wednesday of every month (invalid in Unix)", () => {
    expect(() => converter.unixToQuartz("0 0 * * 3#2")).toThrow();
  });

  test("Multiple days of week (list)", () => {
    const result = converter.unixToQuartz("0 0 * * 1,3,5");
    expect(result).toBe("0 0 0 ? * 2,4,6 *");
  });

  test("Range of days of week", () => {
    const result = converter.unixToQuartz("0 0 * * 1-5");
    expect(result).toBe("0 0 0 ? * 2-6 *");
  });
});

describe("Quartz2Unix Conversion", () => {
  test("Every 5 minutes conversion", () => {
    const result = converter.quartzToUnix("0 */5 * ? * *");
    expect(result).toBe("*/5 * * * *");
  });

  test("Everyday at 12pm conversion", () => {
    const result = converter.quartzToUnix("0 0 12 ? * *");
    expect(result).toBe("0 12 * * *");
  });

  test("Every Monday at 12pm conversion", () => {
    const result = converter.quartzToUnix("0 0 12 ? * 2");
    expect(result).toBe("0 12 * * 1");
  });

  test("Every 10th day of the month conversion", () => {
    const result = converter.quartzToUnix("0 0 0 10 * ?");
    expect(result).toBe("0 0 10 * *");
  });

  test("Every January 1st at 12am conversion", () => {
    const result = converter.quartzToUnix("0 0 0 1 1 ?");
    expect(result).toBe("0 0 1 1 *");
  });

  test("Every last day of the month conversion (invalid in Unix)", () => {
    expect(() => converter.quartzToUnix("0 59 23 L * ?")).toThrow();
  });

  test("Last Friday of every month conversion (invalid in Unix)", () => {
    expect(() => converter.quartzToUnix("0 0 0 ? * 6L")).toThrow();
  });

  test("Second Wednesday of every month conversion (invalid in Unix)", () => {
    expect(() => converter.quartzToUnix("0 0 0 ? * 4#2")).toThrow();
  });

  test("Multiple days of week (list) conversion", () => {
    const result = converter.quartzToUnix("0 0 0 ? * 2,4,6");
    expect(result).toBe("0 0 * * 1,3,5");
  });

  test("Range of days of week conversion", () => {
    const result = converter.quartzToUnix("0 0 0 ? * 2-6");
    expect(result).toBe("0 0 * * 1-5");
  });
});

describe("Description", () => {
  test("Describe every 5 minutes (Unix)", () => {
    const result = describer.describeUnix("*/5 * * * *");
    expect(result).toBe("Every 5 minutes");
  });

  test("Describe every 5 minutes (Quartz)", () => {
    const result = describer.describeQuartz("0 */5 * * * *");
    expect(result).toBe("Every 5 minutes");
  });

  test("Describe every 5 minutes with 0/5 Quartz notation", () => {
    const result = describer.describeQuartz("0 0/5 * * * *");
    expect(result).toBe("Every 5 minutes");
  });

  test("Describe daily at 8:00 AM (Unix)", () => {
    const result = describer.describeUnix("0 8 * * *");
    expect(result).toBe("At 8:00 AM");
  });

  test("Describe daily at 8:00 AM (Quartz)", () => {
    const result = describer.describeQuartz("0 0 8 * * *");
    expect(result).toBe("At 8:00 AM");
  });

  test("Describe every 2 hours with 0/2 Quartz notation", () => {
    const result = describer.describeQuartz("0 0 0/2 * * *");
    expect(result).toBe("Every 2 hours");
  });

  test("Describe 7-field Quartz expression (with year)", () => {
    const result = describer.describeQuartz("0 */5 * * * ? *");
    expect(result).toBe("Every 5 minutes");
  });

  test("Describe last day of month (Quartz)", () => {
    const result = describer.describeQuartz("0 0 0 L * ?");
    expect(result).toBe("At midnight on the last day of the month");
  });

  test("Describe at second 30 (Quartz)", () => {
    const result = describer.describeQuartz("30 0 8 * * *");
    expect(result).toBe("At second 30 At 8:00 AM");
  });

  test("Describe every moment (all wildcards, Unix)", () => {
    const result = describer.describeUnix("* * * * *");
    expect(result).toBe("Every moment");
  });

  test("Describe every moment (all wildcards, Quartz)", () => {
    const result = describer.describeQuartz("* * * * * *");
    expect(result).toBe("Every moment");
  });

  test("Describe in January (Unix)", () => {
    const result = describer.describeUnix("0 0 1 1 *");
    expect(result).toBe("At midnight on the 1st of the month in January");
  });

  test("Describe on Sunday (Unix)", () => {
    const result = describer.describeUnix("0 0 * * 0");
    expect(result).toBe("At midnight on Sunday");
  });

  test("Describe on Saturday (Unix)", () => {
    const result = describer.describeUnix("0 0 * * 6");
    expect(result).toBe("At midnight on Saturday");
  });

  test("Invalid Unix cron expression (too few fields)", () => {
    const result = describer.describeUnix("* * * *");
    expect(result).toBe("Invalid Unix cron expression");
  });

  test("Invalid Quartz cron expression (too few fields)", () => {
    const result = describer.describeQuartz("* * * * *");
    expect(result).toBe("Invalid Quartz cron expression");
  });

  test("Invalid Unix cron expression (empty string)", () => {
    const result = describer.describeUnix("");
    expect(result).toBe("Invalid Unix cron expression");
  });
});

describe("Converter: round-trip DOW conversions", () => {
  const dowCases: Array<[string, string, string]> = [
    ["Monday (1)", "0 0 * * 1", "0 0 0 ? * 2 *"],
    ["Tuesday (2)", "0 0 * * 2", "0 0 0 ? * 3 *"],
    ["Wednesday (3)", "0 0 * * 3", "0 0 0 ? * 4 *"],
    ["Thursday (4)", "0 0 * * 4", "0 0 0 ? * 5 *"],
    ["Friday (5)", "0 0 * * 5", "0 0 0 ? * 6 *"],
    ["Saturday (6)", "0 0 * * 6", "0 0 0 ? * 7 *"],
  ];

  dowCases.forEach(([label, unix, quartz]) => {
    test(`unixToQuartz: ${label}`, () => {
      expect(converter.unixToQuartz(unix)).toBe(quartz);
    });
  });

  const reverseDownCases: Array<[string, string, string]> = [
    ["Sunday (1)", "0 0 0 ? * 1", "0 0 * * 0"],
    ["Monday (2)", "0 0 0 ? * 2", "0 0 * * 1"],
    ["Tuesday (3)", "0 0 0 ? * 3", "0 0 * * 2"],
    ["Wednesday (4)", "0 0 0 ? * 4", "0 0 * * 3"],
    ["Thursday (5)", "0 0 0 ? * 5", "0 0 * * 4"],
    ["Friday (6)", "0 0 0 ? * 6", "0 0 * * 5"],
    ["Saturday (7)", "0 0 0 ? * 7", "0 0 * * 6"],
  ];

  reverseDownCases.forEach(([label, quartz, unix]) => {
    test(`quartzToUnix: ${label}`, () => {
      expect(converter.quartzToUnix(quartz)).toBe(unix);
    });
  });
});

describe("Converter: Quartz 0/N step notation", () => {
  test("quartzToUnix converts 0/5 minutes to */5", () => {
    expect(converter.quartzToUnix("0 0/5 * ? * *")).toBe("*/5 * * * *");
  });

  test("quartzToUnix converts 0/15 minutes to */15", () => {
    expect(converter.quartzToUnix("0 0/15 * ? * *")).toBe("*/15 * * * *");
  });

  test("quartzToUnix converts 0/2 hours to */2", () => {
    expect(converter.quartzToUnix("0 0 0/2 ? * *")).toBe("0 */2 * * *");
  });
});

describe("Converter: error handling", () => {
  test("unixToQuartz throws on null/empty input", () => {
    expect(() => converter.unixToQuartz("")).toThrow();
  });

  test("quartzToUnix throws on null/empty input", () => {
    expect(() => converter.quartzToUnix("")).toThrow();
  });

  test("unixToQuartz throws on wrong field count (4 fields)", () => {
    expect(() => converter.unixToQuartz("* * * *")).toThrow();
  });

  test("unixToQuartz throws on wrong field count (8 fields)", () => {
    expect(() => converter.unixToQuartz("* * * * * * * *")).toThrow();
  });

  test("quartzToUnix throws on 5-field expression", () => {
    expect(() => converter.quartzToUnix("* * * * *")).toThrow();
  });

  test("quartzToUnix throws on 8-field expression", () => {
    expect(() => converter.quartzToUnix("* * * * * * * *")).toThrow();
  });

  test("unixToQuartz throws when both DOM and DOW are specific", () => {
    expect(() => converter.unixToQuartz("0 0 15 * 1")).toThrow("Quartz cron does not support specifying both Day of Month and Day of Week");
  });
});

describe("Converter: deduplication of DOW values", () => {
  test("unixToQuartz deduplicates redundant DOW values (e.g. 0,7)", () => {
    expect(converter.unixToQuartz("0 0 * * 0,7")).toBe("0 0 0 ? * 1 *");
  });

  test("quartzToUnix deduplicates redundant DOW values (e.g. 2,2)", () => {
    expect(converter.quartzToUnix("0 0 0 ? * 2,2")).toBe("0 0 * * 1");
  });
});

describe("ExpressionHelper whitespace robustness", () => {
  test("handles multiple spaces, tabs, and leading/trailing whitespace correctly", () => {
    expect(converter.unixToQuartz("  0   12   *   *   *  ")).toBe("0 0 12 * * * *");
    expect(converter.unixToQuartz("0\t12\t*\t*\t*")).toBe("0 0 12 * * * *");
  });
});

describe("Converter: optional year parameter", () => {
  test("unixToQuartz accepts specific year", () => {
    expect(converter.unixToQuartz("0 12 * * 1", "2026")).toBe("0 0 12 ? * 2 2026");
  });

  test("unixToQuartz throws on invalid specific year", () => {
    expect(() => converter.unixToQuartz("0 12 * * 1", "invalid_year")).toThrow();
    expect(() => converter.unixToQuartz("0 12 * * 1", "1969")).toThrow(); // out of range
  });

  test("round-tripping Quartz -> Unix -> Quartz with specific years", () => {
    const originalQuartz = "0 0 12 ? * 2 2026";
    const unix = converter.quartzToUnix(originalQuartz); // "0 12 * * 1"
    
    const parts = originalQuartz.split(/\s+/);
    const year = parts.length === 7 ? parts[6] : "*";
    
    const reconstructedQuartz = converter.unixToQuartz(unix, year);
    expect(reconstructedQuartz).toBe(originalQuartz);
  });
});

describe("Validator Checks", () => {
  test("validateUnix detects out of range minutes", () => {
    expect(validator.isValidUnix("60 * * * *")).toBe(false);
  });

  test("validateUnix detects invalid chars", () => {
    expect(validator.isValidUnix("*/0 * * * *")).toBe(false);
    expect(validator.isValidUnix("a * * * *")).toBe(false);
  });

  test("validateQuartz detects out of range hours", () => {
    expect(validator.isValidQuartz("0 0 24 * * ?")).toBe(false);
  });

  test("validateQuartz detects invalid month aliases", () => {
    expect(validator.isValidQuartz("0 0 12 ? ABC *")).toBe(false);
  });

  test("validateQuartz accepts step syntax with ranges", () => {
    expect(validator.isValidQuartz("0 0-30/5 * ? * *")).toBe(true);
  });

  test("validateQuartz detects invalid step increments", () => {
    expect(validator.isValidQuartz("0 */0 * ? * *")).toBe(false);
  });
});

describe("@-macro support", () => {
  test("@yearly converts to quartz", () => {
    expect(converter.unixToQuartz("@yearly")).toBe("0 0 0 1 1 ? *");
  });

  test("@annually converts to quartz (alias for @yearly)", () => {
    expect(converter.unixToQuartz("@annually")).toBe("0 0 0 1 1 ? *");
  });

  test("@monthly converts to quartz", () => {
    expect(converter.unixToQuartz("@monthly")).toBe("0 0 0 1 * ? *");
  });

  test("@weekly converts to quartz (Sunday=1 in Quartz)", () => {
    expect(converter.unixToQuartz("@weekly")).toBe("0 0 0 ? * 1 *");
  });

  test("@daily converts to quartz", () => {
    expect(converter.unixToQuartz("@daily")).toBe("0 0 0 * * * *");
  });

  test("@midnight converts to quartz (alias for @daily)", () => {
    expect(converter.unixToQuartz("@midnight")).toBe("0 0 0 * * * *");
  });

  test("@hourly converts to quartz", () => {
    expect(converter.unixToQuartz("@hourly")).toBe("0 0 * * * * *");
  });

  test("@reboot throws a clear error", () => {
    expect(() => converter.unixToQuartz("@reboot")).toThrow(/@reboot/);
  });

  test("unknown macro throws", () => {
    expect(() => converter.unixToQuartz("@unknown")).toThrow(/Unknown cron macro/);
  });

  test("isValidUnix accepts @daily", () => {
    expect(validator.isValidUnix("@daily")).toBe(true);
  });

  test("isValidUnix rejects @reboot", () => {
    expect(validator.isValidUnix("@reboot")).toBe(false);
  });

  test("macro matching is case-insensitive", () => {
    expect(converter.unixToQuartz("@DAILY")).toBe("0 0 0 * * * *");
    expect(converter.unixToQuartz("@Daily")).toBe("0 0 0 * * * *");
  });

  test("describeUnix handles @daily", () => {
    expect(describer.describeUnix("@daily")).toBe("At midnight");
  });

  test("describeUnix handles @hourly", () => {
    expect(describer.describeUnix("@hourly")).toBe("Every hour");
  });
});

describe("Describer: time formatting", () => {
  test("midnight (Unix)", () => {
    expect(describer.describeUnix("0 0 * * *")).toBe("At midnight");
  });

  test("noon (Unix)", () => {
    expect(describer.describeUnix("0 12 * * *")).toBe("At noon");
  });

  test("2:30 AM combined time (Unix)", () => {
    expect(describer.describeUnix("30 2 * * *")).toBe("At 2:30 AM");
  });

  test("11:45 PM combined time (Unix)", () => {
    expect(describer.describeUnix("45 23 * * *")).toBe("At 11:45 PM");
  });

  test("24-hour format At 14:30 (Unix)", () => {
    expect(describer.describeUnix("30 14 * * *", { use24HourTimeFormat: true })).toBe("At 14:30");
  });

  test("24-hour format At 00:00 midnight (Unix)", () => {
    expect(describer.describeUnix("0 0 * * *", { use24HourTimeFormat: true })).toBe("At 00:00");
  });

  test("24-hour format At 08:00 AM (Unix)", () => {
    expect(describer.describeUnix("0 8 * * *", { use24HourTimeFormat: true })).toBe("At 08:00");
  });

  test("noon in 24-hour format (Unix)", () => {
    expect(describer.describeUnix("0 12 * * *", { use24HourTimeFormat: true })).toBe("At 12:00");
  });

  test("2:30 AM in Quartz", () => {
    expect(describer.describeQuartz("0 30 2 * * *")).toBe("At 2:30 AM");
  });

  test("use24HourTimeFormat in Quartz", () => {
    expect(describer.describeQuartz("0 30 14 * * *", { use24HourTimeFormat: true })).toBe("At 14:30");
  });
});

describe("Next run helper", () => {
  test("returns the next Unix runs at 15 minute intervals", () => {
    const runs = getNextRuns("*/15 * * * *", 3, new Date(2026, 0, 1, 0, 0, 0));

    expect(runs).toHaveLength(3);
    expect(runs.map((run) => run.getMinutes())).toEqual([15, 30, 45]);
    expect(runs.every((run) => run.getHours() === 0)).toBe(true);
  });

  test("supports Unix macros", () => {
    const runs = getNextRuns("@daily", 1, new Date(2026, 0, 1, 12, 0, 0));

    expect(runs).toHaveLength(1);
    expect(runs[0].getHours()).toBe(0);
    expect(runs[0].getDate()).toBe(2);
  });

  test("supports Quartz expressions with seconds", () => {
    const runs = getNextRuns("30 0 * * * *", 2, new Date(2026, 0, 1, 0, 0, 0));

    expect(runs).toHaveLength(2);
    expect(runs[0].getSeconds()).toBe(30);
    expect(runs[0].getMinutes()).toBe(0);
    expect(runs[1].getHours()).toBe(1);
    expect(runs[1].getMinutes()).toBe(0);
    expect(runs[1].getSeconds()).toBe(30);
  });

  test("supports Quartz nth weekday schedules", () => {
    const runs = getNextRuns("0 0 12 ? * 2#1 *", 1, new Date(2026, 0, 1, 0, 0, 0));

    expect(runs).toHaveLength(1);
    expect(runs[0].getHours()).toBe(12);
    expect(runs[0].getMinutes()).toBe(0);
    expect(runs[0].getDay()).toBe(1);
  });

  test("rejects invalid count values", () => {
    expect(() => getNextRuns("*/15 * * * *", 0)).toThrow("count must be a positive integer");
    expect(() => getNextRuns("*/15 * * * *", -1)).toThrow("count must be a positive integer");
  });

  test("rejects invalid fromDate values", () => {
    expect(() => getNextRuns("*/15 * * * *", 1, new Date("invalid"))).toThrow("fromDate must be a valid Date");
  });
});

