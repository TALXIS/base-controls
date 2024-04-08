import numeral from "numeral";

export class NumeralPCF {
    private static _registered: boolean;
    public static register(formatting: ComponentFramework.UserSettingApi.NumberFormattingInfo) {
        if(NumeralPCF._registered) {
            return;
        }
        this._registered = true;
        numeral.register('locale', '__pcfcustom', {
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
}