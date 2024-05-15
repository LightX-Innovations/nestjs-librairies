import { add, differenceInDays, format } from "date-fns";
import { frCA, enCA } from "date-fns/locale";

export class DateUtils {
    /**
     * Return the given Date in SQL Date (Sequelize DateOnly) format (yyyy-mm-dd)
     * @param {Date} date
     * @returns {string}
     */
    public static toDateOnly(date: Date): string {
        const m = date.getUTCMonth() + 1;
        const month = m > 9 ? `0${m}` : m.toString();
        const day = date.getUTCDate() > 9 ? `0${date.getUTCDate()}` : date.getUTCDate().toString();
        return `${date.getUTCFullYear()}-${month}-${day}`;
    }

    public static toUtc(date: Date): number {
        return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    }

    public static toUtcFromDateOnly(date: string): number {
        const dates = date.split("-");
        return Date.UTC(+dates[0], +dates[1] - 1, +dates[2]);
    }

    public static toUtcFromString(date: string): Date | null {
        return this.isValid(date) ? new Date(date) : null;
    }

    public static isValid(date: any): boolean {
        return date !== null && date !== "Invalid date";
    }

    public static getIsoDateOnly(date = new Date()): string {
        return date
            .toISOString()
            .split("T")
            .shift() as string;
    }

    public static getUtcDateOnly(date: Date | string): Date;
    public static getUtcDateOnly(year: number, month: number, date: number): Date;
    public static getUtcDateOnly(...args: any[]): Date {
        if (args.length === 1) {
            const [data] = args as [Date | string];
            const date = new Date(data);
            return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
        }

        const [year, month, date] = args as [number, number, number];
        return new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
    }

    public static getUtcTime(date = new Date()): string {
        return `${date.getUTCHours()}:${date.getUTCMinutes()}`;
    }

    public static getDatesBetween(
        start: Date,
        end: Date,
        granularity: "days" | "months" | "weeks",
        untilToday: boolean = false
    ): Date[] {
        const dates: Date[] = [start];

        const now = new Date();
        let nextDate = add(start, { [granularity]: 1 });
        while (differenceInDays(nextDate, end) < 0 && (!untilToday || differenceInDays(nextDate, now) < 0)) {
            dates.push(nextDate);
            nextDate = add(start, { [granularity]: 1 });
        }
        return dates;
    }

    public static format(lang: string, date: Date): string {
        const locales: { [key: string]: Locale } = { fr: frCA, en: enCA }
        return format(date, "LL", { locale: locales[lang] });
    }
}
