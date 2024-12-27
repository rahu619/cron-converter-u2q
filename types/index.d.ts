declare module 'cron-converter-u2q' {
    export const CronConverterU2QModule: {
        unixToQuartz(unixExpression: string): string;
        quartzToUnix(quartzExpression: string): string;
        describeUnix(unixExpression: string): string;
        describeQuartz(quartzExpression: string): string
    }
}
