import { ExpressionHelper as helper } from "./helper";

export class CronDescriberU2Q {
  /**
   * Generates a human-readable description for a Unix-style cron expression.
   *
   * Unix-style cron expressions consist of 5 parts:
   * - Minute (0-59)
   * - Hour (0-23)
   * - Day of Month (1-31)
   * - Month (1-12)
   * - Day of Week (0-6, where 0 = Sunday)
   * @param unixExpression - A string containing the Unix-style cron expression.
   * @returns A human-readable description or an error message if invalid.
   */
  public static describeUnix(unixExpression: string): string {
    try {
      const parts = helper.GetExpressionParts(unixExpression);
      if (parts.length !== 5) {
        return "Invalid Unix cron expression";
      }

      const [min, hour, dom, month, dow] = parts;

      const descriptions = [
        this.describeMinute(min, true),
        this.describeHour(hour),
        this.describeDayOfMonth(dom),
        this.describeMonth(month),
        this.describeDayOfWeek(dow),
      ];

      return this.combineDescriptions(descriptions);
    } catch (error) {
      return "Invalid Unix cron expression";
    }
  }

  /**
   * Generates a human-readable description for a Quartz-style cron expression.
   *
   * Quartz-style cron expressions consist of 6 parts:
   * - Second (0-59)
   * - Minute (0-59)
   * - Hour (0-23)
   * - Day of Month (1-31)
   * - Month (1-12)
   * - Day of Week (0-6, where 0 = Sunday)
   * @param quartzExpression - A string containing the Quartz-style cron expression.
   * @returns A human-readable description or an error message if invalid.
   */
  public static describeQuartz(quartzExpression: string): string {
    try {
      const parts = helper.GetExpressionParts(quartzExpression);
      if (parts.length !== 6) {
        return "Invalid Quartz cron expression";
      }

      const [second, min, hour, dom, month, dow] = parts;

      const descriptions = [
        this.describeSecond(second, true),
        this.describeMinute(min, true),
        this.describeHour(hour),
        this.describeDayOfMonth(dom),
        this.describeMonth(month),
        this.describeDayOfWeek(dow),
      ];

      return this.combineDescriptions(descriptions);
    } catch (error) {
      return "Invalid Quartz cron expression";
    }
  }

  private static describeSecond(second: string, suppressZero = false): string {
    if (second === "*" || (suppressZero && second === "0")) return ""; // Suppress default
    if (second.startsWith("*/")) return `Every ${second.split("/")[1]} seconds`;
    return `At second ${second}`;
  }

  private static describeMinute(min: string, suppressZero = false): string {
    if (min === "*" || (suppressZero && min === "0")) return ""; // Suppress default
    if (min.startsWith("*/")) return `Every ${min.split("/")[1]} minutes`;
    return `At minute ${min}`;
  }

  private static describeHour(hour: string): string {
    if (hour === "*") return ""; // Default behavior
    if (hour.startsWith("*/")) return `Every ${hour.split("/")[1]} hours`;
    return `At ${hour} o'clock`;
  }

  private static describeDayOfMonth(dom: string): string {
    if (dom === "*") return ""; // Default behavior
    return `on the ${this.ordinalSuffix(Number(dom))} of the month`;
  }

  private static describeMonth(month: string): string {
    if (month === "*") return ""; // Default behavior
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const monthIndex = Number(month) - 1;
    return months[monthIndex]
      ? `in ${months[monthIndex]}`
      : "Invalid month value";
  }

  private static describeDayOfWeek(dow: string): string {
    if (dow === "*") return ""; // Default behavior
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayIndex = Number(dow);
    return days[dayIndex]
      ? `on ${days[dayIndex]}`
      : "Invalid day of week value";
  }

  private static ordinalSuffix(i: number): string {
    if (i <= 0) return "Invalid day";
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11) return i + "st";
    if (j === 2 && k !== 12) return i + "nd";
    if (j === 3 && k !== 13) return i + "rd";
    return i + "th";
  }

  private static combineDescriptions(descriptions: string[]): string {
    const filteredDescriptions = descriptions.filter(
      (part) => part && part !== ""
    );
    return filteredDescriptions.length > 0
      ? filteredDescriptions.join(" ").trim()
      : "Every moment"; // Default if all parts are wildcards
  }
}
