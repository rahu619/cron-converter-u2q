# cron-converter-u2q

[![NPM version](https://img.shields.io/npm/v/cron-converter-u2q)](https://www.npmjs.com/package/cron-converter-u2q)
[![npm downloads](https://img.shields.io/npm/dm/cron-converter-u2q)](https://www.npmjs.com/package/cron-converter-u2q)
[![GitHub License](https://img.shields.io/github/license/rahu619/cron-converter-u2q?style=plastic)](LICENSE)
[![GitHub Build](https://github.com/rahu619/cron-converter-u2q/actions/workflows/integration.yml/badge.svg?branch=main)](https://github.com/rahu619/cron-converter-u2q/actions)

A lightweight, zero-dependency TypeScript utility to convert, validate, and describe cron expressions. Seamlessly translate between Unix and Quartz schedules, perform boundary checks, and render human-readable descriptions.

---

## Unix vs. Quartz Cron

| Specification | Fields | Format | Support |
| :--- | :--- | :--- | :--- |
| **Unix Cron** | 5 fields | `min hour dom month dow` | Standard POSIX (Linux, Crontab) |
| **Quartz Cron** | 6–7 fields | `sec min hour dom month dow [year]` | Java/Spring, AWS EventBridge, Azure |

> [!NOTE]
> Quartz cron requires exactly one of `day-of-month` or `day-of-week` to contain `?` (when specifying a constraint on the other field) to prevent scheduling conflicts.

---

## Installation

```bash
npm install cron-converter-u2q
# or
yarn add cron-converter-u2q
# or
pnpm add cron-converter-u2q
```

---

## Usage

### 1. Two-Way Conversion
Convert seamlessly between formats. Wildcards and aliases are normalized automatically.

```typescript
import { CronConverterU2Q } from 'cron-converter-u2q';

// Unix -> Quartz (adds 0 seconds)
CronConverterU2Q.unixToQuartz('*/15 * * * *');   // "0 */15 * * * * *"
CronConverterU2Q.unixToQuartz('0 12 * * 1');     // "0 0 12 ? * 2 *"

// Quartz -> Unix (drops seconds/year)
CronConverterU2Q.quartzToUnix('0 0 8 * * ?');    // "0 8 * * *"
CronConverterU2Q.quartzToUnix('0 */5 * ? * 2');  // "*/5 * * * 1"
```

### 2. Validation
Perform boundary checks, detect syntax errors, and validate range limits.

```typescript
import { CronValidatorU2Q } from 'cron-converter-u2q';

// Validate and throw detailed error messages
CronValidatorU2Q.validateUnix('60 * * * *');    // Throws: "Value 60 is out of range (0-59) for Minute"
CronValidatorU2Q.validateQuartz('0 */0 * ? * *'); // Throws: "Invalid step value in Minute: 0"

// Boolean check
CronValidatorU2Q.isValidUnix('*/5 * * * *');    // true
CronValidatorU2Q.isValidQuartz('0 0 12 * * * *'); // true (both are allowed to be '*' in this package)
```

### 3. Human-Readable Descriptions
Render cron schedules into clear, natural English. Fully supports lists, ranges, step modifiers, and Quartz special symbols.

```typescript
import { CronDescriberU2Q } from 'cron-converter-u2q';

// Unix
CronDescriberU2Q.describeUnix('*/15 * * * *');   // "Every 15 minutes"
CronDescriberU2Q.describeUnix('0 12 1-5 * *');   // "At 12 o'clock from the 1st to the 5th of the month"

// Quartz
CronDescriberU2Q.describeQuartz('0 0 8,12 ? * 2-6 *'); // "At 8 and 12 o'clock from Monday to Friday"
CronDescriberU2Q.describeQuartz('0 0 0 L * ?');        // "At 0 o'clock on the last day of the month"
```

---

## Contributing

Contributions are welcome! Please feel free to open issues or submit Pull Requests.

---

## License

This project is licensed under the MIT License.
