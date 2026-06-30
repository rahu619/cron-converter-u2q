"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronDescriberU2Q = void 0;
const helper_1 = require("./helper");
const validator_1 = require("./validator");
const converter_1 = require("./converter");
class CronDescriberU2Q {
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
    static describeUnix(unixExpression) {
        try {
            validator_1.CronValidatorU2Q.validateUnix(unixExpression);
            const parts = helper_1.ExpressionHelper.GetExpressionParts(unixExpression);
            const [min, hour, dom, month, dow] = parts;
            const descriptions = [
                this.describeMinute(min, true),
                this.describeHour(hour),
                this.describeDayOfMonth(dom),
                this.describeMonth(month),
                this.describeDayOfWeek(dow),
            ];
            return this.combineDescriptions(descriptions);
        }
        catch (error) {
            return "Invalid Unix cron expression";
        }
    }
    /**
     * Generates a human-readable description for a Quartz-style cron expression.
     *
     * Quartz-style cron expressions consist of 6 or 7 parts:
     * - Second (0-59)
     * - Minute (0-59)
     * - Hour (0-23)
     * - Day of Month (1-31)
     * - Month (1-12)
     * - Day of Week (1-7, where 1 = Sunday)
     * - Year (optional)
     * @param quartzExpression - A string containing the Quartz-style cron expression.
     * @returns A human-readable description or an error message if invalid.
     */
    static describeQuartz(quartzExpression) {
        try {
            validator_1.CronValidatorU2Q.validateQuartz(quartzExpression);
            const parts = helper_1.ExpressionHelper.GetExpressionParts(quartzExpression);
            const [second, min, hour, dom, month, dow, year] = parts;
            // Normalize Quartz DOW to Unix DOW for consistent description mapping
            const normalizedDow = converter_1.CronConverterU2Q.quartzDowToUnix(dow);
            const descriptions = [
                this.describeSecond(second, true),
                this.describeMinute(min, true),
                this.describeHour(hour),
                this.describeDayOfMonth(dom),
                this.describeMonth(month),
                this.describeDayOfWeek(normalizedDow),
                this.describeYear(year),
            ];
            return this.combineDescriptions(descriptions);
        }
        catch (error) {
            return "Invalid Quartz cron expression";
        }
    }
    static describeSecond(second, suppressZero = false) {
        if (second === "*" || (suppressZero && second === "0"))
            return "";
        const desc = this.describeField(second, { nameMap: null, unitSingular: "second", unitPlural: "seconds" });
        if (desc.startsWith("every") || desc.startsWith("from")) {
            return desc.charAt(0).toUpperCase() + desc.slice(1);
        }
        return `At second ${desc}`;
    }
    static describeMinute(min, suppressZero = false) {
        if (min === "*" || (suppressZero && min === "0"))
            return "";
        const desc = this.describeField(min, { nameMap: null, unitSingular: "minute", unitPlural: "minutes" });
        if (desc.startsWith("every") || desc.startsWith("from")) {
            return desc.charAt(0).toUpperCase() + desc.slice(1);
        }
        return `At minute ${desc}`;
    }
    static describeHour(hour) {
        if (hour === "*")
            return "";
        const desc = this.describeField(hour, { nameMap: null, unitSingular: "hour", unitPlural: "hours" });
        if (desc.startsWith("every") || desc.startsWith("from")) {
            return desc.charAt(0).toUpperCase() + desc.slice(1);
        }
        return `At ${desc} o'clock`;
    }
    static describeDayOfMonth(dom) {
        const desc = this.describeField(dom, {
            nameMap: null,
            unitSingular: "day of month",
            unitPlural: "days of month",
            isDom: true
        });
        if (!desc)
            return "";
        if (desc.startsWith("every") || desc.startsWith("from"))
            return desc;
        return `on the ${desc} of the month`;
    }
    static describeMonth(month) {
        const desc = this.describeField(month, {
            nameMap: [
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
            ],
            unitSingular: "month",
            unitPlural: "months"
        });
        if (!desc)
            return "";
        if (desc.startsWith("every") || desc.startsWith("from"))
            return desc;
        return `in ${desc}`;
    }
    static describeDayOfWeek(dow) {
        const desc = this.describeField(dow, {
            nameMap: [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ],
            unitSingular: "day of week",
            unitPlural: "days of week",
            isDow: true
        });
        if (!desc)
            return "";
        if (desc.startsWith("every") || desc.startsWith("from"))
            return desc;
        return `on ${desc}`;
    }
    static describeYear(year) {
        if (!year || year === "*")
            return "";
        const desc = this.describeField(year, {
            nameMap: null,
            unitSingular: "year",
            unitPlural: "years"
        });
        if (!desc)
            return "";
        if (desc.startsWith("every") || desc.startsWith("from"))
            return desc;
        return `in ${desc}`;
    }
    static resolveValue(val, config) {
        if (config.isDow) {
            if (val.endsWith("L")) {
                const day = val.slice(0, -1);
                return `last ${this.resolveValue(day, config)}`;
            }
            if (val.includes("#")) {
                const [day, nth] = val.split("#");
                const nthStr = this.ordinalSuffix(Number(nth));
                return `${nthStr} ${this.resolveValue(day, config)}`;
            }
            let dowVal = val.toUpperCase();
            const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
            const aliasIndex = dayNames.indexOf(dowVal);
            let index = aliasIndex !== -1 ? aliasIndex : Number(val);
            if (index === 7)
                index = 0;
            return config.nameMap ? config.nameMap[index] || val : val;
        }
        if (config.isDom) {
            if (val === "L")
                return "last day";
            if (val === "LW")
                return "last weekday";
            if (val.endsWith("W")) {
                const day = val.slice(0, -1);
                return `nearest weekday to the ${this.resolveValue(day, config)}`;
            }
            if (val.startsWith("L-")) {
                const offset = val.slice(2);
                return `${offset} days before the last day`;
            }
            return this.ordinalSuffix(Number(val));
        }
        if (config.nameMap) {
            let mVal = val.toUpperCase();
            const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            const aliasIndex = monthNames.indexOf(mVal);
            let index = aliasIndex !== -1 ? aliasIndex : Number(val) - 1;
            return config.nameMap[index] || val;
        }
        return val;
    }
    static describeField(value, config) {
        if (value === "*" || value === "?")
            return "";
        const parts = value.split(",");
        const descriptions = parts.map(part => {
            if (part.includes("/")) {
                const [start, step] = part.split("/");
                const stepNum = Number(step);
                const unit = stepNum === 1 ? config.unitSingular : config.unitPlural;
                if (start === "*" || start === "0") {
                    return `every ${step} ${unit}`;
                }
                else {
                    const startDesc = this.resolveValue(start, config);
                    return `every ${step} ${unit} starting from ${startDesc}`;
                }
            }
            if (part.includes("-")) {
                const [start, end] = part.split("-");
                const startDesc = this.resolveValue(start, config);
                const endDesc = this.resolveValue(end, config);
                return `from ${startDesc} to ${endDesc}`;
            }
            return this.resolveValue(part, config);
        });
        if (descriptions.length === 1) {
            return descriptions[0];
        }
        else if (descriptions.length === 2) {
            return `${descriptions[0]} and ${descriptions[1]}`;
        }
        else {
            return `${descriptions.slice(0, -1).join(", ")}, and ${descriptions[descriptions.length - 1]}`;
        }
    }
    static ordinalSuffix(i) {
        if (isNaN(i) || i <= 0)
            return "Invalid day";
        const j = i % 10;
        const k = i % 100;
        if (j === 1 && k !== 11)
            return i + "st";
        if (j === 2 && k !== 12)
            return i + "nd";
        if (j === 3 && k !== 13)
            return i + "rd";
        return i + "th";
    }
    static combineDescriptions(descriptions) {
        const filteredDescriptions = descriptions.filter((part) => part && part !== "");
        return filteredDescriptions.length > 0
            ? filteredDescriptions.join(" ").trim()
            : "Every moment";
    }
}
exports.CronDescriberU2Q = CronDescriberU2Q;
