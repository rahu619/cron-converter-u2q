#!/usr/bin/env node

import { CronConverterU2Q, CronDescriberU2Q, CronValidatorU2Q, getNextRuns } from './index';

type CronFormat = 'unix' | 'quartz';

interface CliOptions {
  expression?: string;
  count: number;
  fromDate?: Date;
  help: boolean;
}

function main(): void {
  const options = parseArguments(process.argv.slice(2));

  if (options.help || !options.expression) {
    printHelp();
    process.exitCode = options.help ? 0 : 1;
    return;
  }

  try {
    const expression = options.expression;
    const format = detectFormat(expression);
    const nextRuns = getNextRuns(expression, options.count, options.fromDate);

    console.log(`Expression: ${expression}`);
    console.log(`Format: ${format}`);
    console.log(`Valid Unix: ${CronValidatorU2Q.isValidUnix(expression)}`);
    console.log(`Valid Quartz: ${CronValidatorU2Q.isValidQuartz(expression)}`);

    if (format === 'unix') {
      console.log(`Quartz: ${CronConverterU2Q.unixToQuartz(expression)}`);
      console.log(`Description: ${CronDescriberU2Q.describeUnix(expression)}`);
    } else {
      console.log(`Unix: ${CronConverterU2Q.quartzToUnix(expression)}`);
      console.log(`Description: ${CronDescriberU2Q.describeQuartz(expression)}`);
    }

    console.log('Next runs:');
    nextRuns.forEach((run, index) => {
      console.log(`${index + 1}. ${run.toISOString()}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
    process.exitCode = 1;
  }
}

function detectFormat(expression: string): CronFormat {
  const isUnix = CronValidatorU2Q.isValidUnix(expression);
  const isQuartz = CronValidatorU2Q.isValidQuartz(expression);

  if (isUnix && !isQuartz) {
    return 'unix';
  }
  if (isQuartz && !isUnix) {
    return 'quartz';
  }

  throw new Error('Unable to determine whether the expression is Unix or Quartz');
}

function parseArguments(args: string[]): CliOptions {
  const options: CliOptions = {
    count: 3,
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
      continue;
    }

    if (arg === '--count' || arg === '-n') {
      const nextValue = args[index + 1];
      if (!nextValue) {
        throw new Error('--count requires a number');
      }
      const count = Number(nextValue);
      if (!Number.isInteger(count) || count <= 0) {
        throw new Error('--count must be a positive integer');
      }
      options.count = count;
      index += 1;
      continue;
    }

    if (arg === '--from') {
      const nextValue = args[index + 1];
      if (!nextValue) {
        throw new Error('--from requires an ISO date string');
      }
      const fromDate = new Date(nextValue);
      if (Number.isNaN(fromDate.getTime())) {
        throw new Error('--from must be a valid date');
      }
      options.fromDate = fromDate;
      index += 1;
      continue;
    }

    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }

    if (!options.expression) {
      options.expression = arg;
      continue;
    }

    throw new Error(`Unexpected argument: ${arg}`);
  }

  return options;
}

function printHelp(): void {
  console.log(`Usage: cron-converter-u2q <expression> [options]

Options:
  -n, --count <number>   Number of next runs to print (default: 3)
      --from <date>      ISO date string used as the starting point
  -h, --help             Show this help message

Examples:
  npx cron-converter-u2q "*/15 * * * *"
  npx cron-converter-u2q "0 0 12 ? * 2#1 *"
  npx cron-converter-u2q "@daily" --count 5`);
}

main();
