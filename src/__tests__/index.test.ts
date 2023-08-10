import { CronConverterU2Q } from '../index';

//Basic suite of tests
describe('Unix2Quartz Conversion', () => {

    const converter = new CronConverterU2Q();
    test('unixToQuartz conversion', () => {
        const result = converter.unixToQuartz('*/5 * * * *'); //Every 5 minutes
        expect(result).toBe("0 */5 * ? * *");
    });

    test('unixToQuartz conversion', () => {
        const result = converter.unixToQuartz('0 12 * * *'); //Everyday at 12pm
        expect(result).toBe("0 0 12 ? * *");
    });
});


describe('Quartz2Unix Conversion', () => {
    const converter = new CronConverterU2Q();

    test('quartzToUnix conversion', () => {
        const result = converter.quartzToUnix('* */5 * ? * * *'); //Every 5 minutes
        expect(result).toBe("*/5 * * * *");
    });
});