export class Formatting implements ComponentFramework.Formatting {

    formatCurrency(value: number, precision: number = 2, symbol: string = '$'): string {
        return symbol + value.toFixed(precision);
    }

    formatDecimal(value: number, precision: number = 2): string {
        return value.toFixed(precision);
    }

    formatDateAsFilterStringInUTC(value: Date, includeTime: boolean = false): string {
        const year = value.getUTCFullYear();
        const month = (value.getUTCMonth() + 1).toString().padStart(2, '0');
        const day = value.getUTCDate().toString().padStart(2, '0');
        let formattedDate = `${year}-${month}-${day}`;
        if (includeTime) {
            const hours = value.getUTCHours().toString().padStart(2, '0');
            const minutes = value.getUTCMinutes().toString().padStart(2, '0');
            const seconds = value.getUTCSeconds().toString().padStart(2, '0');
            formattedDate += ` ${hours}:${minutes}:${seconds}`;
        }
        return formattedDate;
    }

    formatDateLong(value: Date): string {
        return value.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    formatDateLongAbbreviated(value: Date): string {
        return value.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
    }

    formatDateShort(value: Date, includeTime: boolean = false): string {
        let options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        if (includeTime) {
            options = { ...options, hour: 'numeric', minute: 'numeric' };
        }
        return value.toLocaleDateString('en-US', options);
    }

    formatDateYearMonth(value: Date): string {
        return value.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    }

    formatInteger(value: number): string {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    formatLanguage(value: number): string {
        // Assuming value corresponds to a language code and returns language name
        return 'Language'; // Placeholder, replace with actual implementation
    }

    formatTime(value: Date, behavior: ComponentFramework.FormattingApi.Types.DateTimeFieldBehavior): string {
        // Implementation depends on behavior, e.g., 12-hour clock, 24-hour clock, etc.
        return value.toLocaleTimeString('en-US');
    }

    getWeekOfYear(value: Date): number {
        const startOfYear = new Date(value.getFullYear(), 0, 0);
        const diff = value.getTime() - startOfYear.getTime();
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        return Math.floor(diff / oneWeek);
    }

}

export class NumberFormattingInfo implements ComponentFramework.UserSettingApi.NumberFormattingInfo {
    currencyDecimalDigits: number;
    currencyDecimalSeparator: string;
    currencyGroupSeparator: string;
    currencyGroupSizes: number[];
    currencyNegativePattern: number;
    currencyPositivePattern: number;
    currencySymbol: string;
    nanSymbol: string;
    nativeDigits: string[];
    negativeInfinitySymbol: string;
    negativeSign: string;
    numberDecimalDigits: number;
    numberDecimalSeparator: string;
    numberGroupSeparator: string;
    numberGroupSizes: number[];
    numberNegativePattern: number;
    perMilleSymbol: string;
    percentDecimalDigits: number;
    percentDecimalSeparator: string;
    percentGroupSeparator: string;
    percentGroupSizes: number[];
    percentNegativePattern: number;
    percentPositivePattern: number;
    percentSymbol: string;
    positiveInfinitySymbol: string;
    positiveSign: string;

    constructor() {
        this.currencyDecimalDigits = 2;
        this.currencyDecimalSeparator = '.';
        this.currencyGroupSeparator = ',';
        this.currencyGroupSizes = [3];
        this.currencyNegativePattern = 1;
        this.currencyPositivePattern = 0;
        this.currencySymbol = '$';
        this.nanSymbol = 'NaN';
        this.nativeDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.negativeInfinitySymbol = '-Infinity';
        this.negativeSign = '-';
        this.numberDecimalDigits = 2;
        this.numberDecimalSeparator = '.';
        this.numberGroupSeparator = ',';
        this.numberGroupSizes = [3];
        this.numberNegativePattern = 1;
        this.perMilleSymbol = '%';
        this.percentDecimalDigits = 2;
        this.percentDecimalSeparator = '.';
        this.percentGroupSeparator = ',';
        this.percentGroupSizes = [3];
        this.percentNegativePattern = 1;
        this.percentPositivePattern = 1;
        this.percentSymbol = '%';
        this.positiveInfinitySymbol = 'Infinity';
        this.positiveSign = '+';
    }
}

export class DateFormattingInfo implements ComponentFramework.UserSettingApi.DateFormattingInfo {
    amDesignator: string;
    abbreviatedDayNames: string[];
    abbreviatedMonthGenitiveNames: string[];
    abbreviatedMonthNames: string[];
    calendarWeekRule: number;
    calendar: ComponentFramework.UserSettingApi.Calendar;
    dateSeparator: string;
    dayNames: string[];
    firstDayOfWeek: ComponentFramework.UserSettingApi.Types.DayOfWeek;
    fullDateTimePattern: string;
    longDatePattern: string;
    longTimePattern: string;
    monthDayPattern: string;
    monthGenitiveNames: string[];
    monthNames: string[];
    pmDesignator: string;
    shortDatePattern: string;
    shortTimePattern: string;
    shortestDayNames: string[];
    sortableDateTimePattern: string;
    timeSeparator: string;
    universalSortableDateTimePattern: string;
    yearMonthPattern: string;

    constructor() {
        this.amDesignator = 'AM';
        this.abbreviatedDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.abbreviatedMonthGenitiveNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        this.abbreviatedMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.calendarWeekRule = 0;
        this.calendar = {
            minSupportedDateTime: new Date(-62135568000000),
            maxSupportedDateTime: new Date(253402300799999),
            algorithmType: 1,
            calendarType: 1,
            twoDigitYearMax: 2029
        }
        this.dateSeparator = '/';
        this.dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.firstDayOfWeek = 0;
        this.fullDateTimePattern = 'dddd, MMMM d, yyyy h:mm:ss tt';
        this.longDatePattern = 'dddd, MMMM d, yyyy';
        this.longTimePattern = 'h:mm:ss tt';
        this.monthDayPattern = 'MMMM d';
        this.monthGenitiveNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.pmDesignator = 'PM';
        this.shortDatePattern = 'M/d/yyyy';
        this.shortTimePattern = 'h:mm tt';
        this.shortestDayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
        this.sortableDateTimePattern = 'yyyy-MM-ddTHH:mm:ss';
        this.timeSeparator = ':';
        this.universalSortableDateTimePattern = 'yyyy-MM-dd HH:mm:ssZ';
        this.yearMonthPattern = 'MMMM yyyy';
    }
}

