# cron-converter-u2q

[![npm version](https://img.shields.io/npm/v/cron-converter-u2q)](https://www.npmjs.com/package/cron-converter-u2q)
[![npm downloads](https://img.shields.io/npm/dm/cron-converter-u2q)](https://www.npmjs.com/package/cron-converter-u2q)
[![npm unpacked size](https://img.shields.io/npm/unpacked-size/cron-converter-u2q)](https://www.npmjs.com/package/cron-converter-u2q)
[![Build](https://github.com/rahu619/cron-converter-u2q/actions/workflows/integration.yml/badge.svg)](https://github.com/rahu619/cron-converter-u2q/actions/workflows/integration.yml)
[![License: MIT](https://img.shields.io/npm/l/cron-converter-u2q)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen)](package.json)

**What is cron-converter-u2q?** A zero-dependency TypeScript toolkit for cron expressions. It covers the four things a team usually needs when a schedule moves between systems, in one install:

* **Convert** between 5-field Unix cron (`crontab`) and 6/7-field Quartz cron — in both directions
* **Validate** expressions with field-level error messages
* **Describe** schedules in plain English (or any locale you register)
* **Compute** upcoming and past run times, with timezone support

![Flow diagram: Unix cron and Quartz cron convert into each other in both directions; either format can also be validated, described in plain English, and turned into next or previous run times](https://raw.githubusercontent.com/rahu619/cron-converter-u2q/main/assets/cron-flow.svg)

Most cron libraries do exactly one of those jobs: `cronstrue` describes, `cron-parser` parses, `cron-to-quartz` converts one way. This one is the only package that converts **both directions** across the full Quartz dialect (`?`, `L`, `W`, `#`) plus `@daily`-style macros — while staying dependency-free.

## Try it right now

The CLI ships with the package, so you can inspect any expression without installing:

```bash
npx cron-converter-u2q "*/15 * * * *"
npx cron-converter-u2q "0 0 12 ? * 2#1 *" --count 2
npx cron-converter-u2q "@daily"
```

One command prints the detected format, validity in both dialects, the converted expression, an English description, and the next run times.

> [!TIP]
> Use `--count <n>` to control how many next runs are printed (default 3), and `--from <ISO date>` to evaluate the schedule from a specific point in time.

## Why cron-converter-u2q?

| Capability | cron-converter-u2q | cronstrue | cron-parser | cron-to-quartz |
| :--- | :-: | :-: | :-: | :-: |
| Unix → Quartz conversion | ✅ | — | — | ✅ |
| Quartz → Unix conversion | ✅ | — | — | — |
| Human-readable descriptions | ✅ | ✅ | — | — |
| Validation with field-level errors | ✅ | — | ✅ (Unix only) | — |
| Next / previous run times | ✅ | — | ✅ | — |
| Zero runtime dependencies | ✅ | ✅ | ✅ | ✅ |

> [!NOTE]
> The comparison reflects each package's published scope as of August 2026. If one of these projects has since added a capability, open an issue and this table will be updated.

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
console.log(quartz); // "0 */15 * * * ? *"

// Unix macros are supported
console.log(CronConverterU2Q.unixToQuartz('@daily'));   // "0 0 0 * * ? *"
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

CronConverterU2Q.unixToQuartz('*/15 * * * *');   // "0 */15 * * * ? *"
CronConverterU2Q.unixToQuartz('0 12 * * 1');     // "0 0 12 ? * 2 *"
CronConverterU2Q.quartzToUnix('0 0 8 * * ?');    // "0 8 * * *"
CronConverterU2Q.quartzToUnix('0 */5 * ? * 2');  // "*/5 * * * 1"
```

Conversion rules worth knowing:

- `unixToQuartz` always emits exactly one `?` between day-of-month and
  day-of-week, as the Quartz spec requires. When both Unix fields are `*`,
  the day-of-week field becomes `?` (the schedule still runs every day).
- Unix day-of-week ranges and steps that reach Sunday via the `7` alias
  (e.g. `5-7`, `1/2`) are converted to the equivalent Quartz day sets.
- `quartzToUnix` requires the Quartz second field to be `0`. Unix cron has
  no second resolution, so any other value throws instead of silently
  changing the schedule's frequency.

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

## Integrations

Because this package speaks both cron dialects, it pairs well with platforms whose schedulers expect one or the other.

### AWS EventBridge

[EventBridge Scheduler](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html) accepts a Quartz-derived cron format: six fields (`minutes hours day-of-month month day-of-week year`), day-of-week numbered `1-7` with `1 = SUN`, the same "one of day-of-month / day-of-week must be `?`" rule, and `L`, `W`, `#` support. The only difference from Quartz is the missing seconds field — so convert, then drop the leading seconds:

```typescript
import { CronConverterU2Q } from 'cron-converter-u2q';

const quartz = CronConverterU2Q.unixToQuartz('0 9 * * 1-5'); // "0 0 9 ? * 2-6 *"
const eventbridge = quartz.split(' ').slice(1).join(' ');    // "0 9 ? * 2-6 *"
// Use as: cron(0 9 ? * 2-6 *)
```

> [!NOTE]
> `unixToQuartz` output only contains values, lists, ranges, steps, `*`, and `?` — all valid in EventBridge expressions — so this works for any valid Unix input.

### Spring

Spring applications meet both cron dialects:

* **`spring-boot-starter-quartz`** embeds the real Quartz scheduler, so `unixToQuartz` output can be used as-is.
* **`@Scheduled(cron = "...")`** uses Spring's `CronExpression`: six fields starting with seconds, but day-of-week is numbered `0-7` with `0` and `7` meaning Sunday — like Unix, not like Quartz. To migrate a Quartz expression into `@Scheduled`, convert to Unix first, then prepend the seconds field:

```typescript
import { CronConverterU2Q } from 'cron-converter-u2q';

const unix = CronConverterU2Q.quartzToUnix('0 0 12 ? * 2 *'); // "0 12 * * 1"
const scheduled = `0 ${unix}`;                                 // "0 0 12 * * 1"
```

## Feedback & Contributing

Issues and pull requests are welcome. If you find a bug or have a feature request, please open a GitHub issue.

## License

This project is licensed under the [MIT License](LICENSE).
