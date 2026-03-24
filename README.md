# cron-converter-u2q

[![Github Repo Stars](https://img.shields.io/github/stars/rahu619/cron-converter-u2q?style=social)](https://github.com/rahu619/cron-converter-u2q)
[![NPM version](https://img.shields.io/npm/v/@rahu619/cron-converter-u2q)](https://www.npmjs.com/package/@rahu619/cron-converter-u2q)
[![GitHub License](https://img.shields.io/github/license/rahu619/cron-converter-u2q?style=plastic)](LICENSE)
[![GitHub Build](https://github.com/rahu619/cron-converter-u2q/actions/workflows/integration.yml/badge.svg?branch=main)](https://github.com/rahu619/cron-converter-u2q/actions)
[![Github Release](https://github.com/rahu619/cron-converter-u2q/actions/workflows/release.yml/badge.svg?event=workflow_dispatch)](https://github.com/rahu619/cron-converter-u2q/actions)
[![Github Top Language](https://img.shields.io/github/languages/top/rahu619/cron-converter-u2q?style=plastic)](https://www.typescriptlang.org/)
[![npm downloads](https://img.shields.io/npm/dm/@rahu619/cron-converter-u2q)](https://www.npmjs.com/package/@rahu619/cron-converter-u2q)

[![https://nodei.co/npm/@rahu619/cron-converter-u2q.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/@rahu619/cron-converter-u2q.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/@rahu619/cron-converter-u2q)

A powerful TypeScript library for working with cron expressions. Effortlessly convert between Unix and Quartz formats, generate human-readable descriptions, and validate cron expressions with ease.

## ✨ Features

### 🔄 Two-way Conversion
- **Unix to Quartz**: Convert standard Unix cron expressions to Quartz format
- **Quartz to Unix**: Convert Quartz cron expressions to standard Unix format
- **Format Validation**: Built-in validation for both formats
- **Error Handling**: Clear error messages for invalid expressions

### 📝 Human-readable Descriptions
- **Natural Language**: Convert cron expressions to plain English
- **Multiple Languages**: Support for different language descriptions
- **Customizable**: Extend with your own description templates
- **Detailed**: Includes all schedule details (minutes, hours, days, etc.)

### 🛠️ Developer Friendly
- **TypeScript Support**: Full type definitions included
- **Zero Dependencies**: Lightweight and fast
- **Well Tested**: Comprehensive test coverage
- **ES6 Modules**: Support for both CommonJS and ES6 imports

### 🔍 Validation & Error Handling
- **Format Validation**: Ensures cron expressions are valid
- **Range Checking**: Validates field values within acceptable ranges
- **Clear Errors**: Descriptive error messages for debugging
- **Type Safety**: TypeScript types for better development experience

## 📦 Installation

```bash
# Using npm
npm install @rahu619/cron-converter-u2q

# Using yarn
yarn add @rahu619/cron-converter-u2q

# Using pnpm
pnpm add @rahu619/cron-converter-u2q
```

## 🚀 Quick Start

```typescript
import { CronConverterU2Q, CronDescriberU2Q } from '@rahu619/cron-converter-u2q';

// Convert Unix to Quartz
const quartzExpression = CronConverterU2Q.unixToQuartz('5 * * * *');
console.log(quartzExpression); // "0 5 * * * ? *"

// Convert Quartz to Unix
const unixExpression = CronConverterU2Q.quartzToUnix('0 0 8 * * ?');
console.log(unixExpression); // "0 8 * * *"
// Get human-readable description
const description = CronDescriberU2Q.describeUnix('*/5 * * * *');
console.log(description); // "Every 5 minutes"
```

## 📚 Examples

### Basic Conversions

```typescript
// Unix to Quartz
CronConverterU2Q.unixToQuartz('0 12 * * *');     // "0 0 12 * * ? *"
CronConverterU2Q.unixToQuartz('*/15 * * * *');   // "0 */15 * * * ? *"
// Quartz to Unix
CronConverterU2Q.quartzToUnix('0 0 8 * * ?');    // "0 8 * * *"
CronConverterU2Q.quartzToUnix('0 */5 * * * ?');  // "*/5 * * * *"
```

### Human-readable Descriptions

```typescript
// Unix format descriptions
CronDescriberU2Q.describeUnix('0 12 * * *');     // "At 12 o'clock"
CronDescriberU2Q.describeUnix('*/15 * * * *');   // "Every 15 minutes"

// Quartz format descriptions
CronDescriberU2Q.describeQuartz('0 0 8 * * ?');  // "At 8 o'clock"
CronDescriberU2Q.describeQuartz('0 */5 * * * ?'); // "Every 5 minutes"
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- 📧 Email: rahu619@gmail.com
- 💻 GitHub Issues: [Create an issue](https://github.com/rahu619/cron-converter-u2q/issues)
- ⭐ Star the repository if you find it useful!

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspired by the need for a simple, reliable cron expression converter
- Built with TypeScript for better developer experience

## 📖 Specifications

This library's conversion logic is grounded in the following official specifications:

- **POSIX IEEE Std 1003.1** – Defines the standard Unix cron expression format (5 fields: minute, hour, day-of-month, month, day-of-week).
  [https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html)

- **Quartz Scheduler** – Defines the extended Quartz cron trigger format (6–7 fields: seconds, minute, hour, day-of-month, month, day-of-week, optional year). Notably, exactly one of `day-of-month` or `day-of-week` must be `?` to avoid scheduling conflicts.
  [https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)

