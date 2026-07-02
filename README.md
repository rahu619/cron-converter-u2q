# cron-converter-u2q

A TypeScript library to convert, validate, and describe cron expressions between Unix and Quartz formats. It has zero external dependencies and is fully typed.

## Features

- **Bidirectional Conversion**: Translate expressions between Unix (5 fields) and Quartz (6 or 7 fields) standards.
- **Strict Validation**: Perform boundary checks and detect syntax anomalies (e.g. invalid step values, out-of-bounds ranges).
- **Human-Readable Descriptions**: Generate English text representations of Unix and Quartz expressions.
- **Zero Dependencies**: Lightweight footprint, compatible with Node.js and browser environments.

## Understanding Unix vs. Quartz Cron

Cron syntax has evolved from local POSIX system scheduling to enterprise cloud workflow engines. This library addresses the incompatibility between the two most common formats:

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

## Installation

```bash
npm install cron-converter-u2q
```

## API Usage

### 1. Bidirectional Conversion

The `CronConverterU2Q` class handles conversion. During Unix -> Quartz conversion, it prepends `0` for seconds, appends `*` for the year, and maps day-of-week indices.

```typescript
import { CronConverterU2Q } from 'cron-converter-u2q';

// Unix to Quartz
const quartz1 = CronConverterU2Q.unixToQuartz('*/15 * * * *');   // "0 */15 * * * * *"
const quartz2 = CronConverterU2Q.unixToQuartz('0 12 * * 1');     // "0 0 12 ? * 2 *"

// Quartz to Unix (seconds and years are stripped)
const unix1 = CronConverterU2Q.quartzToUnix('0 0 8 * * ?');    // "0 8 * * *"
const unix2 = CronConverterU2Q.quartzToUnix('0 */5 * ? * 2');  // "*/5 * * * 1"
```

### 2. Validation

`CronValidatorU2Q` provides both assertion methods (which throw detailed errors) and boolean checks.

```typescript
import { CronValidatorU2Q } from 'cron-converter-u2q';

// Throws detailed validation errors
try {
  CronValidatorU2Q.validateUnix('60 * * * *');
} catch (err) {
  // Throws: "Value 60 is out of range (0-59) for Minute"
}

try {
  CronValidatorU2Q.validateQuartz('0 */0 * ? * *');
} catch (err) {
  // Throws: "Invalid step value in Minute: 0"
}

// Boolean validation helpers
const isValidUnix = CronValidatorU2Q.isValidUnix('*/5 * * * *'); // true
const isValidQuartz = CronValidatorU2Q.isValidQuartz('0 0 12 * * * *'); // true
```

### 3. Expression Description

`CronDescriberU2Q` translates expressions into natural English descriptions.

```typescript
import { CronDescriberU2Q } from 'cron-converter-u2q';

// Unix
const descUnix1 = CronDescriberU2Q.describeUnix('*/15 * * * *'); // "Every 15 minutes"
const descUnix2 = CronDescriberU2Q.describeUnix('0 12 1-5 * *'); // "At 12 o'clock from the 1st to the 5th of the month"

// Quartz
const descQuartz1 = CronDescriberU2Q.describeQuartz('0 0 8,12 ? * 2-6 *'); // "At 8 and 12 o'clock from Monday to Friday"
const descQuartz2 = CronDescriberU2Q.describeQuartz('0 0 0 L * ?');        // "At 0 o'clock on the last day of the month"
```

## Development

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## License

MIT
