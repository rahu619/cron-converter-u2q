import { CronConverterU2Q as c2q } from '../index';

//Basic suite of tests
describe('Unix2Quartz Conversion', () => {

    test('Every 5 minutes', () => {
        const result = c2q.unixToQuartz('*/5 * * * *');
        expect(result).toBe("0 */5 * ? * *");
    });

    test('Everyday at 12pm', () => {
        const result = c2q.unixToQuartz('0 12 * * *');
        expect(result).toBe("0 0 12 ? * *");
    });

    test('Every Monday at 12pm conversion', () => {
        const result = c2q.unixToQuartz('0 12 * * 1');
        expect(result).toBe("0 0 12 ? * 1");
    });

    test('Every 10th day of the month conversion', () => {
        const result = c2q.unixToQuartz('0 0 10 * *');
        expect(result).toBe("0 0 0 10 * ?");
    });

    test('Every January 1st at 12am conversion', () => {
        const result = c2q.unixToQuartz('0 0 1 1 *');
        expect(result).toBe("0 0 0 1 1 ?");
    });

    test('Every last day of the month conversion', () => {
        const result = c2q.unixToQuartz('59 23 L * *');
        expect(result).toBe("0 59 23 L * ?");
    });

    //Failing test case
    // test('Every last Friday of the month conversion', () => {
    //     const result = c2q.unixToQuartz('0 0 L * 5');
    //     expect(result).toBe("0 0 0 ? * 5L");
    // });

});


describe('Quartz2Unix Conversion', () => {

    test('Every 5 minutes conversion', () => {
        const result = c2q.quartzToUnix('0 */5 * ? * *');
        expect(result).toBe("*/5 * * * *");
    });

    test('Everyday at 12pm conversion', () => {
        const result = c2q.quartzToUnix('0 0 12 ? * *');
        expect(result).toBe("0 12 * * *");
    });

    test('Every Monday at 12pm conversion', () => {
        const result = c2q.quartzToUnix('0 0 12 ? * 1');
        expect(result).toBe("0 12 * * 1");
    });

    test('Every 10th day of the month conversion', () => {
        const result = c2q.quartzToUnix('0 0 0 10 * ?');
        expect(result).toBe("0 0 10 * *");
    });

    test('Every January 1st at 12am conversion', () => {
        const result = c2q.quartzToUnix('0 0 0 1 1 ?');
        expect(result).toBe("0 0 1 1 *");
    });

    test('Every last day of the month conversion', () => {
        const result = c2q.quartzToUnix('0 59 23 L * ?');
        expect(result).toBe("59 23 L * *");
    });

    //Failing test case
    // test('Every last Friday of the month conversion', () => {
    //     const result = c2q.quartzToUnix('0 0 0 ? * 5L');
    //     expect(result).toBe("0 0 L * 5");
    // });
});