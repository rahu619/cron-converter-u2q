# cron-converter-u2q

![Github Repo Stars](https://img.shields.io/github/stars/rahu619/cron-converter-u2q?style=social)
[![NPM version](https://img.shields.io/npm/v/cron-converter-u2q)](https://www.npmjs.com/package/cron-converter-u2q)
![GitHub License](https://img.shields.io/github/license/rahu619/cron-converter-u2q?style=plastic)
![GitHub Build](https://github.com/rahu619/cron-converter-u2q/actions/workflows/integration.yml/badge.svg?branch=main)
![Github Release](https://github.com/rahu619/cron-converter-u2q/actions/workflows/release.yml/badge.svg?event=workflow_dispatch)
![Github Top Language](https://img.shields.io/github/languages/top/rahu619/cron-converter-u2q?style=plastic)

[![https://nodei.co/npm/cron-converter-u2q.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/cron-converter-u2q.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/cron-converter-u2q)

Easily work with cron expressions using the `cron-converter-u2q` package. Effortlessly convert between Unix and Quartz formats and describe cron schedules in plain language.

### Features

:arrows_counterclockwise: **Two-way conversion**

Effortlessly convert cron expressions: 
- From Unix to Quartz 
- From Quartz to Unix

:memo: **Human-readable Descriptions**

Translate cron schedules into plain, understandable text: 
- Example:  `*/5 * * * *` -> "Every 5 minutes"

### Installation

Using npm:

```bash
npm install cron-converter-u2q
```

Using yarn:

```bash
yarn add cron-converter-u2q
```

### Usage

Firstly, import the CronConverterU2Q module:

```javascript
var cron_converter_u2q = require("cron-converter-u2q");

var c2q = cron_converter_u2q.CronConverterU2Q;
```

If you're using ES6 Modules

```javascript
import { CronConverterU2QModule as c2q } from "cron-converter-u2q";
```

### Conversion Methods

#### Convert from Unix to Quartz:

```javascript
const quartzExpression = c2q.unixToQuartz("5 * * * *");
```

#### Convert from Quartz to Unix:

```javascript
const unixExpression = c2q.quartzToUnix("* */5 * ? * * *");
```

### Description Methods

You can now generate human-readable descriptions for Unix and Quartz cron expressions.

#### Describe Unix Cron Expressions:

```javascript
const description = c2q.describeUnix("5 * * * *");
console.log(description); // Outputs: "Every 5 minutes"
```

#### Describe Quartz Cron Expressions:

```javascript
const description = c2q.describeQuartz("0 0 8 * * ?");
console.log(description); // Outputs: "At 8 o'clock"
```

## License
This project is licensed under the [MIT License](https://opensource.org/license/mit/)


### Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

### Support
Any feedback, suggestions, or contributions are highly appreciated!

