# cron-converter-u2q

Easily convert cron expressions between Unix and Quartz formats with the `cron-converter-u2q` package

![example event parameter](https://github.com/rahu619/cron-converter-u2q/actions/workflows/integration.yml/badge.svg?event=push)
[![NPM version](https://badge.fury.io/js/cron-conveter-u2q.svg)](https://www.npmjs.com/package/cron-conveter-u2q)

### Features

:arrows_counterclockwise: Two-way conversion: from Unix to Quartz and Quartz to Unix.

### Installation

Using npm:

```bash
npm install cron-converter
```

Using yarn:

```bash
yarn add cron-converter
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

Convert from Unix to Quartz

```javascript
const quartzExpression = c2q.unixToQuartz("5 * * * *");
```

Convert from Quartz to Unix

```javascript
const unixExpression = c2q.quartzToUnix("* */5 * ? * * *");
```

### Development Notice

This package is still under active development. Some methods and features might not be stable yet. We're working diligently to improve and stabilize the package. Any feedback, suggestions, or contributions are highly appreciated!

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/)
