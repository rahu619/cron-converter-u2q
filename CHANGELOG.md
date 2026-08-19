# Changelog

All notable changes to **cron-converter-u2q** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> This changelog was introduced retroactively with 1.7.0. Entries for earlier
> releases are reconstructed from the git history and npm publish dates.

## [1.7.0] - 2026-08-19

### Fixed

- Day-of-week conversion for ranges and steps that reach Sunday through the
  `7` alias.
- Quartz `?` placement — exactly one of day-of-month / day-of-week is emitted
  as `?`, as the Quartz spec requires.
- Next-run scanning accuracy around edge dates.

## [1.6.0] - 2026-07-09

### Added

- Locale support: `registerLocale`, `loadLocale`, and the `CronLocale` /
  `CronLocaleJSON` contracts, with English (`en`) as the built-in locale.
- `getPreviousRuns` for enumerating past run times.
- `locale` and `timezone` options for run-time computation.

## [1.5.0] - 2026-07-09

### Added

- `getNextRuns` for enumerating upcoming run times of an expression.

## [1.4.0] - 2026-07-09

### Added

- `CronDescriberU2Q`: human-readable descriptions for Unix and Quartz
  expressions.

## [1.3.3] - 2026-06-30

### Fixed

- `types` path in `package.json` now points into `lib/`.

## [1.3.2] - 2026-06-30

### Added

- Optional trailing `year` field support.
- Whitespace-tolerant parsing.
- Day-of-week deduplication and validation for mutually exclusive
  day-of-month / day-of-week values.

## [1.3.1] - 2026-06-30

### Changed

- Package is now published unscoped as `cron-converter-u2q`.

## [1.3.0] - 2026-06-30

### Added

- `CronValidatorU2Q`: expression validation with field-level errors.
- Initial human-readable description support.

## [1.2.2] and earlier

- Bidirectional Unix ⇄ Quartz conversion, including `L`, `W`, `#` handling,
  advanced day-of-week support, and spec-conformance fixes. See the git
  history (tags `0.1.14` – `1.2.2`) for details.
