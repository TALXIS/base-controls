import numeral from "numeral";

export class NumeralPCF {
    public static decimal(formatting: ComponentFramework.UserSettingApi.NumberFormattingInfo) {
        const locale = {
            ordinal: (num: number) => {
                return '.';
            },
            currency: {
                symbol: formatting.currencySymbol
            },
            abbreviations: {
                thousand: 'k',
                million: 'm',
                billion: 'b',
                trillion: 't'
            },
            delimiters: {
                decimal: formatting.numberDecimalSeparator,
                thousands: formatting.numberGroupSeparator,
            }
        };
        if (!this._locales.includes('__pcfcustomdecimal')) {
            numeral.register('locale', '__pcfcustomdecimal', locale);
        }
        else {
            numeral.locales['__pcfcustomdecima'] = locale;
        }
        numeral.locale('__pcfcustomdecimal');
    }

    public static currency(formatting: ComponentFramework.UserSettingApi.NumberFormattingInfo) {
        const locale = {
            ordinal: (num: number) => {
                return '.';
            },
            currency: {
                symbol: formatting.currencySymbol
            },
            abbreviations: {
                thousand: 'k',
                million: 'm',
                billion: 'b',
                trillion: 't'
            },
            delimiters: {
                decimal: formatting.currencyDecimalSeparator,
                thousands: formatting.currencyGroupSeparator,
            }
        };
        if (!this._locales.includes('__pcfcustomcurrency')) {
            numeral.register('locale', '__pcfcustomcurrency', locale);
        }
        else {
            numeral.locales['__pcfcustomcurrency'] = locale;
        }
        numeral.locale('__pcfcustomcurrency');
    }
    private static get _locales() {
        return Object.keys(numeral.locales);
    }
}