import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getDateTimeStyles = (theme: ITheme) => {
    return mergeStyleSets({
        datePicker: {
            '[class^="statusMessage"]': {
                display: 'none'
            }
        },
        calendarCallout: {
            '[class*="TALXIS__timepicker__root"]': {
                padding: 12,
                'label': {
                    paddingTop: 0
                },
                'i': {
                    fontSize: 16
                }
            },
            'hr': {
                margin: 0,
                border: 'none',
                height: 1,
                backgroundColor: theme.semanticColors.bodyDivider
            },
            '[class^="monthAndYear"], [class*="weekDayLabelCell"]': {
                animationDuration: '0s'
            },
            '.ms-DatePicker': {
                animationDuration: '0s'
            }
        }
    });
};