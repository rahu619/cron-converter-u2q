# cron-converter-u2q

A TypeScript library to convert, validate, and describe cron expressions between Unix and Quartz formats. It has zero external dependencies, is fully typed, and is designed for Node.js and browser environments.

## What is cron-converter-u2q?

`cron-converter-u2q` provides bidirectional translation between standard 5-field Unix cron schedules and 6-to-7-field Quartz cron schedules. Additionally, the library includes a built-in validator with descriptive boundary-checking and an English-expression generator to describe schedules in natural language.

## Key Features

* **Bidirectional Translation**: Seamless conversion between POSIX-compliant Unix expressions and Quartz-compliant expressions.
* **Granular Validation**: Detects and reports precise syntax errors (e.g., out-of-range bounds, step-value limits).
* **Natural Language Describer**: Renders cron schedules into clear, readable English sentences.
* **Lightweight Footprint**: Compiled with zero external runtime dependencies.

## Installation

Install the package via your preferred package manager:

### npm
```bash
npm install cron-converter-u2q
```

### Yarn
```bash
yarn add cron-converter-u2q
```

### pnpm
```bash
pnpm add cron-converter-u2q
```

## Quick Start

```typescript
import { CronConverterU2Q, CronValidatorU2Q, CronDescriberU2Q } from 'cron-converter-u2q';

// Convert Unix to Quartz
const quartz = CronConverterU2Q.unixToQuartz('*/15 * * * *'); 
console.log(quartz); // "0 */15 * * * * *"

// Describe Quartz cron in plain English
const description = CronDescriberU2Q.describeQuartz('0 0 12 ? * 2#1 *');
console.log(description); // "At 12:00 PM on the first Monday of every month"

// Validate expressions
const isValid = CronValidatorU2Q.isValidUnix('60 * * * *'); // false
```

## Understanding Unix vs. Quartz Cron

Cron specifications differ based on environment requirements. This library handles the mapping and behavioral nuances between POSIX and Quartz standards:

### Unix Cron (POSIX Standard)
Unix cron is the classic 5-field format used by Unix/Linux system daemons (`crontab`):
`minute hour day-of-month month day-of-week`

- **Minute-level resolution**: The minimum interval is one minute; there is no seconds field.
- **Index mapping**: Day-of-week ranges from `0` to `7`, where both `0` and `7` represent Sunday.
- **Logical OR behavior**: If both `day-of-month` and `day-of-week` are restricted (i.e. not `*`), the job runs when *either* field matches. For example, `0 0 15 * 1` executes at midnight on the 15th of the month AND on every Monday.

#### Unix Examples:
- `*/15 9-17 * * 1-5`: Every 15 minutes, from 9:00 AM to 5:45 PM, Monday through Friday.
- `0 12 1,15 * *`: At 12:00 PM on the 1st and 15th of every month.

---

### Quartz Cron (Enterprise Standard)
Quartz cron originates from the Java ecosystem and is widely adopted by modern cloud schedulers (e.g., AWS EventBridge, Azure Functions). It uses a 6- or 7-field format:
`second minute hour day-of-month month day-of-week [year]`

- **Second-level resolution**: Seconds are defined in the first field.
- **Index mapping**: Day-of-week ranges from `1` (Sunday) to `7` (Saturday).
- **Explicit exclusion (`?`)**: To resolve the ambiguous Unix logical OR behavior, Quartz requires you to define exactly one day field as unrestricted using `?`. You cannot use `*` for both `day-of-month` and `day-of-week` if one of them has a specific value.
- **Advanced characters**: Supports complex day descriptors like `L` (last day of the month/week), `W` (nearest weekday), and `#` (nth weekday of the month, such as `6#3` for the third Friday).

#### Quartz Examples:
- `0 0 12 ? * 2#1 *`: At 12:00 PM on the first Monday of every month.
- `0 0 0 L * ? *`: At midnight on the last day of every month.
- `0 15 10 ? * 6L *`: At 10:15 AM on the last Friday of every month.

---

## Spec Comparison

| Specification | Field Count | Format | Day-of-Week (DOW) Mapping |
| :--- | :--- | :--- | :--- |
| **Unix Cron** | 5 | `minute hour day-of-month month day-of-week` | `0-7` (0 or 7 is Sunday, 1 is Monday) |
| **Quartz Cron** | 6 or 7 | `second minute hour day-of-month month day-of-week [year]` | `1-7` (1 is Sunday, 2 is Monday) |

---

## API Reference

### Conversion

`CronConverterU2Q` provides static methods for bidirectional conversion. During Unix -> Quartz conversion, it prepends `0` for seconds, appends `*` for the year, and maps day-of-week indices.

```typescript
import { CronConverterU2Q } from 'cron-converter-u2q';

// Unix -> Quartz
CronConverterU2Q.unixToQuartz('*/15 * * * *');   // "0 */15 * * * * *"
CronConverterU2Q.unixToQuartz('0 12 * * 1');     // "0 0 12 ? * 2 *"

// Quartz -> Unix (seconds and years are stripped)
CronConverterU2Q.quartzToUnix('0 0 8 * * ?');    // "0 8 * * *"
CronConverterU2Q.quartzToUnix('0 */5 * ? * 2');  // "*/5 * * * 1"
```

### Validation

`CronValidatorU2Q` handles syntax validation.

```typescript
import { CronValidatorU2Q } from 'cron-converter-u2q';

// validateUnix / validateQuartz will throw detailed validation errors if invalid
try {
  CronValidatorU2Q.validateUnix('60 * * * *');
} catch (err) {
  // Throws: "Value 60 is out of range (0-59) for Minute"
}

// isValidUnix / isValidQuartz return boolean values
const isValid = CronValidatorU2Q.isValidUnix('*/5 * * * *'); // true
```

### Description

`CronDescriberU2Q` translates expressions into natural English descriptions.

```typescript
import { CronDescriberU2Q } from 'cron-converter-u2q';

// Describe Unix schedules
CronDescriberU2Q.describeUnix('*/15 * * * *'); // "Every 15 minutes"

// Describe Quartz schedules
CronDescriberU2Q.describeQuartz('0 0 0 L * ?'); // "At 0 o'clock on the last day of the month"
```

## Feedback & Contributing

Feedback, issues, and pull requests are welcome. If you find a bug or have a feature request, please open a GitHub issue.

## License

This project is licensed under the [MIT License](LICENSE).
