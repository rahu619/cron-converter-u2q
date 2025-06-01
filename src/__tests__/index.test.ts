import {
  CronConverterU2Q as converter,
  CronDescriberU2Q as describer,
} from "../index";

//Basic suite of tests
describe("Unix2Quartz Conversion", () => {
  test("Every minute", () => {
    const result = converter.unixToQuartz("* * * * *");
    expect(result).toBe("0 * * ? * *");
  });

  test("Every 5 minutes", () => {
    const result = converter.unixToQuartz("*/5 * * * *");
    expect(result).toBe("0 */5 * ? * *");
  });

  test("Every hour at minute 30", () => {
    const result = converter.unixToQuartz("30 * * * *");
    expect(result).toBe("0 30 * ? * *");
  });

  test("Everyday at 12pm", () => {
    const result = converter.unixToQuartz("0 12 * * *");
    expect(result).toBe("0 0 12 ? * *");
  });

  test("Every Monday at 12pm", () => {
    const result = converter.unixToQuartz("0 12 * * 1");
    expect(result).toBe("0 0 12 ? * 1");
  });

  test("Every 10th day of the month", () => {
    const result = converter.unixToQuartz("0 0 10 * *");
    expect(result).toBe("0 0 0 10 * ?");
  });

  test("Every January 1st at 12am", () => {
    const result = converter.unixToQuartz("0 0 1 1 *");
    expect(result).toBe("0 0 0 1 1 ?");
  });

  test("Every last day of the month", () => {
    const result = converter.unixToQuartz("59 23 L * *");
    expect(result).toBe("0 59 23 L * ?");
  });

  test("Every day at 2:30 AM", () => {
    const result = converter.unixToQuartz("30 2 * * *");
    expect(result).toBe("0 30 2 ? * *");
  });

  test("Every Monday at 2:30 AM", () => {
    const result = converter.unixToQuartz("30 2 * * 1");
    expect(result).toBe("0 30 2 ? * 1");
  });

  test("Every day at 1:00 AM and 1:00 PM", () => {
    const result = converter.unixToQuartz("0 1,13 * * *");
    expect(result).toBe("0 0 1,13 ? * *");
  });

  test("Every 15 minutes", () => {
    const result = converter.unixToQuartz("*/15 * * * *");
    expect(result).toBe("0 */15 * ? * *");
  });

  test("Last Friday of every month", () => {
    const result = converter.unixToQuartz("0 0 * * 5L");
    expect(result).toBe("0 0 0 ? * 5L");
  });

  test("Second Wednesday of every month", () => {
    const result = converter.unixToQuartz("0 0 * * 3#2");
    expect(result).toBe("0 0 0 ? * 3#2");
  });

  test("Multiple days of week (list)", () => {
    const result = converter.unixToQuartz("0 0 * * 1,3,5");
    expect(result).toBe("0 0 0 ? * 1,3,5");
  });

  test("Range of days of week", () => {
    const result = converter.unixToQuartz("0 0 * * 1-5");
    expect(result).toBe("0 0 0 ? * 1-5");
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

  test("Every last day of the month conversion", () => {
    const result = converter.quartzToUnix("0 59 23 L * ?");
    expect(result).toBe("59 23 L * *");
  });

  test("Last Friday of every month conversion", () => {
    const result = converter.quartzToUnix("0 0 0 ? * 5L");
    expect(result).toBe("0 0 * * 5L");
  });

  test("Second Wednesday of every month conversion", () => {
    const result = converter.quartzToUnix("0 0 0 ? * 3#2");
    expect(result).toBe("0 0 * * 3#2");
  });

  test("Multiple days of week (list) conversion", () => {
    const result = converter.quartzToUnix("0 0 0 ? * 1,3,5");
    expect(result).toBe("0 0 * * 1,3,5");
  });

  test("Range of days of week conversion", () => {
    const result = converter.quartzToUnix("0 0 0 ? * 1-5");
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

  test("Describe daily at 8:00 AM (Unix)", () => {
    const result = describer.describeUnix("0 8 * * *");
    expect(result).toBe("At 8 o'clock");
  });

  test("Describe daily at 8:00 AM (Quartz)", () => {
    const result = describer.describeQuartz("0 0 8 * * *");
    expect(result).toBe("At 8 o'clock");
  });
});
