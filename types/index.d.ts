declare module '@rahu619/cron-converter-u2q' {
    export class CronConverterU2Q {
        static unixToQuartz(unixExpression: string): string;
        static quartzToUnix(quartzExpression: string): string;
    }

    export class CronDescriberU2Q {
        static describeUnix(unixExpression: string): string;
        static describeQuartz(quartzExpression: string): string;
    }
}
