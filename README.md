# cron-converter-u2q

[![npm version](https://img.shields.io/npm/v/cron-converter-u2q)](https://www.npmjs.com/package/cron-converter-u2q)
[![npm downloads](https://img.shields.io/npm/dm/cron-converter-u2q)](https://www.npmjs.com/package/cron-converter-u2q)
[![npm unpacked size](https://img.shields.io/npm/unpacked-size/cron-converter-u2q)](https://www.npmjs.com/package/cron-converter-u2q)
[![Build](https://github.com/rahu619/cron-converter-u2q/actions/workflows/integration.yml/badge.svg)](https://github.com/rahu619/cron-converter-u2q/actions/workflows/integration.yml)
[![License: MIT](https://img.shields.io/npm/l/cron-converter-u2q)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen)](package.json)

`cron-converter-u2q` is a TypeScript library for converting, validating, describing, and listing run times for cron expressions between Unix and Quartz formats.

## Overview

The package supports four common cron tasks:

* convert Unix cron to Quartz cron
* convert Quartz cron to Unix cron
* validate and describe expressions
* list upcoming run times

## Features

* Conversion between standard 5-field Unix cron and 6/7-field Quartz cron
* Validation with field-level error messages
* English descriptions for Unix and Quartz expressions
* `@` macro support for common Unix shorthands such as `@daily` and `@hourly`
* `getNextRuns` for enumerating upcoming matches
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

// List upcoming run times
const nextRuns = getNextRuns('*/15 * * * *', 3);
console.log(nextRuns.map((date) => date.toISOString()));

// Validate expressions
const isValid = CronValidatorU2Q.isValidUnix('60 * * * *'); // false
```

## Supported Formats

### Unix Cron

Unix cron uses 5 fields:

`minute hour day-of-month month day-of-week`

- Day-of-week values are `0-7` in this package, where `0` and `7` represent Sunday.
- When both day-of-month and day-of-week are restricted, Unix uses OR semantics.

### Quartz Cron

Quartz cron uses 6 or 7 fields:

`second minute hour day-of-month month day-of-week [year]`

- Day-of-week values are `1-7`, where `1` is Sunday.
- Quartz uses `?` to mark one of day-of-month or day-of-week as intentionally unspecified.
- Quartz supports `L`, `W`, and `#` in the day fields.

## API Reference

### Conversion

`CronConverterU2Q` provides static methods for bidirectional conversion.

```typescript
import { CronConverterU2Q } from 'cron-converter-u2q';

CronConverterU2Q.unixToQuartz('*/15 * * * *');   // "0 */15 * * * * *"
CronConverterU2Q.unixToQuartz('0 12 * * 1');     // "0 0 12 ? * 2 *"
CronConverterU2Q.quartzToUnix('0 0 8 * * ?');    // "0 8 * * *"
CronConverterU2Q.quartzToUnix('0 */5 * ? * 2');  // "*/5 * * * 1"
```

#### @-Macro Support

Standard Unix macros are accepted by `unixToQuartz`, `validateUnix`, `isValidUnix`, and `describeUnix`.

| Macro | Expands to |
| :--- | :--- |
| `@yearly` / `@annually` | `0 0 1 1 *` |
| `@monthly` | `0 0 1 * *` |
| `@weekly` | `0 0 * * 0` |
| `@daily` / `@midnight` | `0 0 * * *` |
| `@hourly` | `0 * * * *` |

### Validation

`CronValidatorU2Q` validates Unix and Quartz expressions and returns detailed field errors.

```typescript
import { CronValidatorU2Q } from 'cron-converter-u2q';

CronValidatorU2Q.isValidUnix('*/5 * * * *'); // true
CronValidatorU2Q.isValidQuartz('0 0 12 ? * 2#1 *'); // true

try {
  CronValidatorU2Q.validateUnix('60 * * * *');
} catch (error) {
  console.log(error.message);
}
```

### Description

`CronDescriberU2Q` converts expressions into English descriptions.

```typescript
import { CronDescriberU2Q } from 'cron-converter-u2q';

CronDescriberU2Q.describeUnix('*/15 * * * *');
CronDescriberU2Q.describeUnix('0 0 * * *');
CronDescriberU2Q.describeQuartz('0 0 0 L * ?');
CronDescriberU2Q.describeUnix('30 14 * * *', { use24HourTimeFormat: true });
```

### Next Runs

`getNextRuns(expression, count, fromDate?, options?)` returns the next matching run times as `Date` objects.

`getPreviousRuns(expression, count, fromDate?, options?)` returns the previous matching run times.

Both accept an `options` object with `locale` and/or `timezone`:

- `locale` — a registered locale ID or a `CronLocale` object. Its `timezone` field is used automatically.
- `timezone` — an IANA timezone name. Overrides the locale's timezone when both are set.

```typescript
import { getNextRuns, getPreviousRuns, loadLocale } from 'cron-converter-u2q';

// Load a locale that includes timezone: "Europe/Berlin"
await loadLocale('./locales/de.json');

// Locale drives both language (for describer) and timezone (for run times)
getNextRuns('0 9 * * *', 1, new Date(), { locale: 'de' });
getNextRuns('@daily',    2, new Date(), { locale: 'de' });

// Or pass timezone directly (no locale required)
getNextRuns('0 9 * * *', 1, new Date(), { timezone: 'America/New_York' });

// Both: timezone overrides the locale's built-in timezone
getNextRuns('0 9 * * *', 1, new Date(), { locale: 'de', timezone: 'UTC' });

const previousRuns = getPreviousRuns('*/15 * * * *', 3, new Date(), { locale: 'de' });
```

### Descriptions (i18n)

`CronDescriberU2Q` supports multiple languages via the `locale` option. The only built-in locale is `en` (English). For any other language, use `registerLocale` — see the [Custom Locales](#custom-locales) section below.

```typescript
import { CronDescriberU2Q } from 'cron-converter-u2q';

// English (default)
CronDescriberU2Q.describeUnix('0 9 * * 1-5');
// "At 9:00 AM from Monday to Friday"

// 24-hour format
CronDescriberU2Q.describeUnix('0 9 * * 1-5', { use24HourTimeFormat: true });
// "At 09:00 from Monday to Friday"
```

### CLI

The package also ships a CLI for quick checks.

```bash
npx cron-converter-u2q "*/15 * * * *"
npx cron-converter-u2q "0 0 12 ? * 2#1 *" --count 2
npx cron-converter-u2q "@daily"
```

## Compatibility

| Environment | Support |
| :--- | :--- |
| Node.js | Yes, `>=18` |
| CommonJS | Yes |
| ESM | Yes |
| Browser builds via bundlers | Yes |
| Timezone-aware scheduling | No |

## Limitations

* This library converts and describes cron expressions. It does not schedule jobs.
* `getNextRuns` and `getPreviousRuns` use the native `Intl` API for timezone conversion; timezone accuracy depends on the runtime's IANA timezone database.
* Quartz-only day modifiers such as `L`, `W`, and `#` are preserved when converting Quartz to Quartz-compatible outputs, but not all of them have Unix equivalents.
* Input validation follows the supported Unix and Quartz field rules in this package.
* Built-in description locales are limited to `en` (English). Other languages can be added via `registerLocale` or `loadLocale`, and may include a `timezone` field so one locale object governs both language and clock offset.

## Examples

### Unix Cron

* `*/15 9-17 * * 1-5` - every 15 minutes during business hours, Monday through Friday
* `0 12 1,15 * *` - at 12:00 PM on the 1st and 15th of each month
* `@daily` - every day at midnight

### Quartz Cron

* `0 0 12 ? * 2#1 *` - at 12:00 PM on the first Monday of every month
* `0 0 0 L * ? *` - at midnight on the last day of every month
* `0 15 10 ? * 6L *` - at 10:15 AM on the last Friday of every month

## Custom Locales

The only built-in locale is `en` (English). For any other language, load a locale from a JSON file or provide an inline object.

### Loading from a JSON file (Node.js)

`loadLocale(filePath, localeId?)` reads a locale JSON file from disk, compiles it, and registers it. Call it once at startup.

```typescript
import { loadLocale, CronDescriberU2Q } from 'cron-converter-u2q';

// Load and register — locale id comes from the "id" field in the file
await loadLocale('./locales/de.json');

// Or override the locale ID (useful for regional variants)
await loadLocale('./locales/de.json', 'de-AT');

// Then use it anywhere by the registered id
CronDescriberU2Q.describeUnix('*/5 * * * *', { locale: 'de' });  // "Jede 5 Minuten"
CronDescriberU2Q.describeUnix('0 0 * * *',   { locale: 'de' });  // "Um Mitternacht"
```

The JSON file (`de.json`) must conform to the `CronLocaleJSON` shape exported by the package. All `tokens` keys are required. Ordinals are expressed via the optional `ordinalSuffix` field — omitting it produces bare numbers. The optional `timezone` field is the IANA timezone used by `getNextRuns`/`getPreviousRuns` when this locale is passed.

```json
{
  "id": "de",
  "ordinalSuffix": ".",
  "use24HourTimeFormat": true,
  "timezone": "Europe/Berlin",
  "dayNames": ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
  "monthNames": ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  "tokens": {
    "at": "Um",
    "every": "jede",
    "from": "von",
    "to": "bis",
    "and": "und",
    "in": "im",
    "on": "am",
    "onThe": "am",
    "ofTheMonth": "des Monats",
    "last": "letzten",
    "lastDay": "letzten Tag",
    "lastWeekday": "letzten Werktag",
    "nearestWeekdayTo": "nächsten Werktag zum",
    "daysBeforeLastDay": "Tage vor dem letzten Tag",
    "midnight": "Um Mitternacht",
    "noon": "Um Mittag",
    "am": "AM",
    "pm": "PM",
    "everyMoment": "Jederzeit",
    "everyHour": "Jede Stunde",
    "everyMinuteOfPrefix": "Jede Minute von",
    "atSecond": "In Sekunde",
    "atMinute": "In Minute",
    "startingFrom": "beginnend ab",
    "invalidDay": "Ungültiger Tag",
    "second": "Sekunde",
    "seconds": "Sekunden",
    "minute": "Minute",
    "minutes": "Minuten",
    "hour": "Stunde",
    "hours": "Stunden",
    "dayOfMonth": "Monatstag",
    "daysOfMonth": "Monatstage",
    "month": "Monat",
    "months": "Monate",
    "dayOfWeek": "Wochentag",
    "daysOfWeek": "Wochentage",
    "year": "Jahr",
    "years": "Jahre",
    "listSeparator": ", ",
    "listFinalSeparator": " und "
  }
}
```

### Inline locale

```typescript
import { registerLocale, CronDescriberU2Q } from 'cron-converter-u2q';

registerLocale({
  id: 'de',
  dayNames: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  monthNames: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  ordinal: (n) => `${n}.`,
  use24HourTimeFormat: true,
  tokens: {
    at: 'Um', every: 'jede', from: 'von', to: 'bis', and: 'und',
    in: 'im', on: 'am', onThe: 'am', ofTheMonth: 'des Monats',
    last: 'letzten', lastDay: 'letzten Tag', lastWeekday: 'letzten Werktag',
    nearestWeekdayTo: 'nächsten Werktag zum', daysBeforeLastDay: 'Tage vor dem letzten Tag',
    midnight: 'Um Mitternacht', noon: 'Um Mittag', am: 'AM', pm: 'PM',
    everyMoment: 'Jederzeit', everyHour: 'Jede Stunde', everyMinuteOfPrefix: 'Jede Minute von',
    atSecond: 'In Sekunde', atMinute: 'In Minute', startingFrom: 'beginnend ab',
    invalidDay: 'Ungültiger Tag',
    second: 'Sekunde', seconds: 'Sekunden', minute: 'Minute', minutes: 'Minuten',
    hour: 'Stunde', hours: 'Stunden', dayOfMonth: 'Monatstag', daysOfMonth: 'Monatstage',
    month: 'Monat', months: 'Monate', dayOfWeek: 'Wochentag', daysOfWeek: 'Wochentage',
    year: 'Jahr', years: 'Jahre', listSeparator: ', ', listFinalSeparator: ' und ',
  },
});

CronDescriberU2Q.describeUnix('*/5 * * * *', { locale: 'de' }); // "Jede 5 Minuten"
```

The `CronLocale` and `CronLocaleJSON` types are exported for TypeScript users:

```typescript
import type { CronLocale, CronLocaleJSON } from 'cron-converter-u2q';
```

## Feedback & Contributing

Issues and pull requests are welcome. If you find a bug or have a feature request, please open a GitHub issue.

## License

This project is licensed under the [MIT License](LICENSE).
