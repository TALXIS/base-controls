import numeral from "numeral";

export class NumeralPCF {
    private static _decimalRegistered: boolean;
    private static _currencyRegistered: boolean;

    public static decimal(formatting: ComponentFramework.UserSettingApi.NumberFormattingInfo) {
        if(!this._decimalRegistered) {
            this._decimalRegistered = true;
            numeral.register('locale', '__pcfcustomdecimal', {
                ordinal: (num) => {
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
            });
        }
        else {
            numeral.locale('__pcfcustomdecimal');
        }
    }
    public static currency(formatting: ComponentFramework.UserSettingApi.NumberFormattingInfo) {
        if(!this._currencyRegistered) {
            this._currencyRegistered = true;
            numeral.register('locale', '__pcfcustomcurrency', {
                ordinal: (num) => {
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
            });
        }
        else {
            numeral.locale('__pcfcustomcurrency')
        }
    }
}