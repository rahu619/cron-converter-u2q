import { CronConverterU2Q as c2q } from '../index';

//Basic suite of tests
describe('Unix2Quartz Conversion', () => {

    test('unixToQuartz conversion', () => {
        const result = c2q.unixToQuartz('*/5 * * * *'); //Every 5 minutes
        expect(result).toBe("0 */5 * ? * *");
    });

    test('unixToQuartz conversion', () => {
        const result = c2q.unixToQuartz('0 12 * * *'); //Everyday at 12pm
        expect(result).toBe("0 0 12 ? * *");
    });
});


describe('Quartz2Unix Conversion', () => {

    test('quartzToUnix conversion', () => {
        const result = c2q.quartzToUnix('* */5 * ? * * *'); //Every 5 minutes
        expect(result).toBe("*/5 * * * *");
    });
});