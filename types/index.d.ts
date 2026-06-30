declare module '@rahu619/cron-converter-u2q' {
    export class CronConverterU2Q {
        static unixToQuartz(unixExpression: string): string;
        static quartzToUnix(quartzExpression: string): string;
    }

    export class CronDescriberU2Q {
        static describeUnix(unixExpression: string): string;
        static describeQuartz(quartzExpression: string): string;
    }

    export class CronValidatorU2Q {
        static validateUnix(expression: string): void;
        static validateQuartz(expression: string): void;
        static isValidUnix(expression: string): boolean;
        static isValidQuartz(expression: string): boolean;
    }
}
