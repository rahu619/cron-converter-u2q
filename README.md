# cron-converter-u2q

[![npm version](https://img.shields.io/npm/v/cron-converter-u2q)](https://www.npmjs.com/package/cron-converter-u2q)
[![npm downloads](https://img.shields.io/npm/dm/cron-converter-u2q)](https://www.npmjs.com/package/cron-converter-u2q)
[![npm unpacked size](https://img.shields.io/npm/unpacked-size/cron-converter-u2q)](https://www.npmjs.com/package/cron-converter-u2q)
[![Build](https://github.com/rahu619/cron-converter-u2q/actions/workflows/integration.yml/badge.svg)](https://github.com/rahu619/cron-converter-u2q/actions/workflows/integration.yml)
[![License: MIT](https://img.shields.io/npm/l/cron-converter-u2q)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen)](package.json)

`cron-converter-u2q` is a small TypeScript library for converting, validating, and describing cron expressions between Unix and Quartz formats. It is dependency-free and works in Node.js and bundler-based browser projects.

## Overview

The package covers three common cron tasks:

* convert Unix cron to Quartz cron
* convert Quartz cron to Unix cron
* validate and describe expressions

## Features

* Conversion between standard 5-field Unix cron and 6/7-field Quartz cron
* Validation with field-level error messages
* English descriptions for Unix and Quartz expressions
* Support for common Unix `@` macros such as `@daily` and `@hourly`
* Zero runtime dependencies

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

// Unix macros are supported
console.log(CronConverterU2Q.unixToQuartz('@daily'));   // "0 0 0 * * * *"
console.log(CronConverterU2Q.unixToQuartz('@weekly'));  // "0 0 0 ? * 1 *"
console.log(CronConverterU2Q.unixToQuartz('@monthly')); // "0 0 0 1 * ? *"

// Describe a schedule in plain English
console.log(CronDescriberU2Q.describeUnix('30 9 * * 1-5')); // "At 9:30 AM from Monday to Friday"
console.log(CronDescriberU2Q.describeQuartz('0 0 12 ? * 2#1 *')); // "At noon on the 1st Monday of every month"

// Use 24-hour format
console.log(CronDescriberU2Q.describeUnix('30 14 * * *', { use24HourTimeFormat: true })); // "At 14:30"

// Validate expressions
const isValid = CronValidatorU2Q.isValidUnix('60 * * * *'); // false
```

## Supported Use Cases

This package is useful when a project needs to move cron expressions between Unix-style and Quartz-style systems, or when it needs to validate and describe expressions before storing or displaying them.

| Task | Package |
| :--- | :--- |
| Convert Unix ↔ Quartz format | `cron-converter-u2q` |
| Describe a cron schedule in English | `cronstrue` or `cron-converter-u2q` |
| Iterate next/previous run dates | `cron-parser` or `croner` |
| Schedule and execute jobs | `node-cron` or `croner` |

### Common Integrations

| Platform | Format |
| :--- | :--- |
| Linux `crontab` | Unix (5-field) |
| AWS EventBridge | Quartz (6/7-field) |
| Azure Functions | Quartz (6-field) |
| Spring `@Scheduled` | Quartz (6-field) |
| Java Quartz Scheduler | Quartz (6/7-field) |

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

#### @-macro support

Standard Unix cron macros are accepted as input to `unixToQuartz`, `isValidUnix`, `validateUnix`, and `describeUnix`:

| Macro | Expands to | Description |
| :--- | :--- | :--- |
| `@yearly` / `@annually` | `0 0 1 1 *` | January 1st at midnight |
| `@monthly` | `0 0 1 * *` | First day of each month at midnight |
| `@weekly` | `0 0 * * 0` | Sunday at midnight |
| `@daily` / `@midnight` | `0 0 * * *` | Every day at midnight |
| `@hourly` | `0 * * * *` | At the start of every hour |

```typescript
import { CronConverterU2Q } from 'cron-converter-u2q';

CronConverterU2Q.unixToQuartz('@daily');   // "0 0 0 * * * *"
CronConverterU2Q.unixToQuartz('@weekly');  // "0 0 0 ? * 1 *"
CronConverterU2Q.unixToQuartz('@monthly'); // "0 0 0 1 * ? *"
CronConverterU2Q.unixToQuartz('@yearly');  // "0 0 0 1 1 ? *"
```

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

`CronDescriberU2Q` translates expressions into English descriptions. An optional `DescriberOptions` object can be passed to control output format.

```typescript
import { CronDescriberU2Q } from 'cron-converter-u2q';

// Describe Unix schedules
CronDescriberU2Q.describeUnix('*/15 * * * *');       // "Every 15 minutes"
CronDescriberU2Q.describeUnix('0 0 * * *');          // "At midnight"
CronDescriberU2Q.describeUnix('0 12 * * *');         // "At noon"
CronDescriberU2Q.describeUnix('30 9 * * 1-5');       // "At 9:30 AM from Monday to Friday"

// 24-hour clock format
CronDescriberU2Q.describeUnix('30 14 * * *', { use24HourTimeFormat: true }); // "At 14:30"

// Describe Quartz schedules
CronDescriberU2Q.describeQuartz('0 0 0 L * ?');   // "At midnight on the last day of the month"
CronDescriberU2Q.describeQuartz('0 30 9 ? * 2-6'); // "At 9:30 AM from Monday to Friday"
```

#### Describer Output Examples

| Expression (Unix) | Description |
| :--- | :--- |
| `* * * * *` | Every moment |
| `*/15 * * * *` | Every 15 minutes |
| `@hourly` | Every hour |
| `0 0 * * *` / `@daily` | At midnight |
| `0 12 * * *` | At noon |
| `30 9 * * *` | At 9:30 AM |
| `0 0 * * 0` | At midnight on Sunday |
| `0 9 1 * *` | At 9:00 AM on the 1st of the month |
| `0 9 * * 1-5` | At 9:00 AM from Monday to Friday |

| Expression (Quartz) | Description |
| :--- | :--- |
| `0 0 0 L * ?` | At midnight on the last day of the month |
| `0 0 12 ? * 2#1 *` | At noon on the 1st Monday of every month |
| `0 15 10 ? * 6L *` | At 10:15 AM on the last Friday of every month |

## Feedback & Contributing

Issues and pull requests are welcome. If you find a bug or have a feature request, please open a GitHub issue.

## License

This project is licensed under the [MIT License](LICENSE).
