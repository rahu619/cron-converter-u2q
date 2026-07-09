import { ExpressionHelper } from './helper';

class FieldValidator {
  constructor(
    public min: number,
    public max: number,
    public name: string,
    public aliases: string[] | null = null,
    public allowedSpecial: string[] = []
  ) {}

  public validate(part: string, isQuartz = false): void {
    if (!part) {
      throw new Error(`${this.name} field is empty`);
    }

    const subParts = part.split(",");
    for (const subPart of subParts) {
      this.validateSubPart(subPart, isQuartz);
    }
  }

  private validateSubPart(subPart: string, isQuartz: boolean): void {
    if (subPart === "*") return;
    if (subPart === "?") {
      if (this.allowedSpecial.includes("?")) return;
      throw new Error(`'?' is not allowed in the ${this.name} field`);
    }

    // Step notation: A/B or */B
    if (subPart.includes("/")) {
      const parts = subPart.split("/");
      if (parts.length !== 2) {
        throw new Error(`Invalid step notation: ${subPart}`);
      }
      const [start, step] = parts;
      const stepNum = Number(step);
      if (isNaN(stepNum) || stepNum <= 0) {
        throw new Error(`Invalid step value in ${this.name}: ${step}`);
      }
      if (start !== "*" && start !== "0") {
        if (start.includes("-")) {
          const rangeParts = start.split("-");
          if (rangeParts.length !== 2) {
            throw new Error(`Invalid range in step: ${start}`);
          }
          this.validateSingleValue(rangeParts[0], isQuartz);
          this.validateSingleValue(rangeParts[1], isQuartz);
        } else {
          this.validateSingleValue(start, isQuartz);
        }
      }
      return;
    }

    // Range: A-B
    if (subPart.includes("-")) {
      // Quartz DOM supports L-N (e.g. L-3)
      if (isQuartz && this.name === "Day of Month" && subPart.startsWith("L-")) {
        const offset = subPart.slice(2);
        const offsetNum = Number(offset);
        if (isNaN(offsetNum) || offsetNum < 1 || offsetNum > 31) {
          throw new Error(`Invalid offset in L- offset: ${subPart}`);
        }
        return;
      }

      const parts = subPart.split("-");
      if (parts.length !== 2) {
        throw new Error(`Invalid range notation: ${subPart}`);
      }
      const [start, end] = parts;
      this.validateSingleValue(start, isQuartz);
      this.validateSingleValue(end, isQuartz);

      const startNum = this.parseValue(start);
      const endNum = this.parseValue(end);
      if (!isNaN(startNum) && !isNaN(endNum) && startNum > endNum) {
        throw new Error(`Range start ${start} is greater than range end ${end} in ${this.name}`);
      }
      return;
    }

    // Quartz specific formats in Day of Month and Day of Week
    if (isQuartz) {
      if (this.name === "Day of Month") {
        if (subPart === "L" || subPart === "LW") return;
        if (subPart.endsWith("W")) {
          const day = subPart.slice(0, -1);
          this.validateSingleValue(day, isQuartz);
          return;
        }
      }
      if (this.name === "Day of Week") {
        if (subPart.endsWith("L")) {
          const day = subPart.slice(0, -1);
          this.validateSingleValue(day, isQuartz);
          return;
        }
        if (subPart.includes("#")) {
          const [day, nth] = subPart.split("#");
          this.validateSingleValue(day, isQuartz);
          const nthNum = Number(nth);
          if (isNaN(nthNum) || nthNum < 1 || nthNum > 5) {
            throw new Error(`Invalid nth weekday value in ${this.name}: ${subPart}`);
          }
          return;
        }
      }
    }

    this.validateSingleValue(subPart, isQuartz);
  }

  private validateSingleValue(value: string, isQuartz: boolean): void {
    if (value === "") {
      throw new Error(`Empty value is not allowed in ${this.name}`);
    }
    const num = this.parseValue(value);
    if (isNaN(num)) {
      throw new Error(`Invalid value in ${this.name}: ${value}`);
    }

    const currentMin = this.min;
    const currentMax = this.max;

    if (num < currentMin || num > currentMax) {
      throw new Error(`Value ${value} is out of range (${currentMin}-${currentMax}) for ${this.name}`);
    }
  }

  private parseValue(value: string): number {
    const valUpper = value.toUpperCase();
    if (this.aliases) {
      const idx = this.aliases.indexOf(valUpper);
      if (idx !== -1) {
        if (this.name === "Day of Week") {
          return idx + (this.min === 1 ? 1 : 0);
        }
        return idx + 1;
      }
    }
    return Number(value);
  }
}

const MONTH_ALIASES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DOW_ALIASES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const unixValidators = [
  new FieldValidator(0, 59, "Minute"),
  new FieldValidator(0, 23, "Hour"),
  new FieldValidator(1, 31, "Day of Month"),
  new FieldValidator(1, 12, "Month", MONTH_ALIASES),
  new FieldValidator(0, 7, "Day of Week", DOW_ALIASES),
];

const quartzValidators = [
  new FieldValidator(0, 59, "Second"),
  new FieldValidator(0, 59, "Minute"),
  new FieldValidator(0, 23, "Hour"),
  new FieldValidator(1, 31, "Day of Month", null, ["?"]),
  new FieldValidator(1, 12, "Month", MONTH_ALIASES),
  new FieldValidator(1, 7, "Day of Week", DOW_ALIASES, ["?"]),
  new FieldValidator(1970, 2099, "Year"),
];

export class CronValidatorU2Q {
  public static validateUnix(expression: string): void {
    if (typeof expression !== "string") {
      throw new Error("Cron expression must be a string");
    }
    expression = ExpressionHelper.expandMacro(expression);
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) {
      throw new Error(`Unix cron expression must have exactly 5 fields, got ${parts.length}`);
    }

    for (let i = 0; i < 5; i++) {
      unixValidators[i].validate(parts[i], false);
    }
  }

  public static validateQuartz(expression: string): void {
    if (typeof expression !== "string") {
      throw new Error("Cron expression must be a string");
    }
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 6 && parts.length !== 7) {
      throw new Error(`Quartz cron expression must have 6 or 7 fields, got ${parts.length}`);
    }

    for (let i = 0; i < parts.length; i++) {
      quartzValidators[i].validate(parts[i], true);
    }

    const dom = parts[3];
    const dow = parts[5];
    const hasDomQ = dom.includes("?");
    const hasDowQ = dow.includes("?");

    if (dom === "*" && dow === "*") {
      // Both are allowed to be '*' (every day)
    } else {
      if (hasDomQ && hasDowQ) {
        throw new Error("Quartz expression cannot have '?' in both Day of Month and Day of Week");
      }
      if (!hasDomQ && !hasDowQ) {
        throw new Error("Quartz expression must have '?' in either Day of Month or Day of Week");
      }
    }
  }

  public static isValidUnix(expression: string): boolean {
    try {
      this.validateUnix(expression);
      return true;
    } catch {
      return false;
    }
  }

  public static isValidQuartz(expression: string): boolean {
    try {
      this.validateQuartz(expression);
      return true;
    } catch {
      return false;
    }
  }
}
