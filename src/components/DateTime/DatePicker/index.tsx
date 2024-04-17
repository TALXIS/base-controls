//@ts-nocheck
import * as React from 'react';
import { DatePicker as DatePickerBase } from './base/DatePicker'
import { IBorderless, IReadOnly, IErrorMessage, IDisabled, IDeleteButton, ISuffix, IPrefix, ICopyButton } from '../../interfaces/components';
import { useTheme } from '@fluentui/react/lib/utilities/ThemeProvider/useTheme';
import { ICalendarProps } from '@fluentui/react/lib/components/Calendar/Calendar.types';
import { IDatePickerProps as IDatePickerPropsBase } from '@fluentui/react/lib/components/DatePicker/DatePicker.types';
import { getDatePickerStyles } from './styles';
import uniqid from 'uniqid';


export interface IDatePickerProps extends Omit<IDatePickerPropsBase, 'prefix'>, IBorderless, IReadOnly,
    IErrorMessage, IDisabled, IDeleteButton, ISuffix, IPrefix, ICopyButton, IDeleteButton {
    /**  
* Props for the default calendar button.
*/
    calendarButtonProps?: any;
}

export const DatePicker: React.FC<IDatePickerProps> = (props) => {
    const theme = useTheme();
    const ref = React.useRef<HTMLDivElement>(null);
    const datePickerClassId = React.useMemo(() => {
        return uniqid();
    }, []);
    const getClassNames = () => {
        let className = 'TALXIS__date-picker__root';
        if (props.readOnly) {
            className += '--read-only';
        }
        if (props.disableHoverAnimation) {
            className += '--animation-disabled';
        }
        if (props.errorMessage && props.errorMessage != '') {
            className += '--has-error'
        }
        if (props.className) {
            className += ` ${props.className}`;
        }
        return `${className} ${getDatePickerStyles(theme, datePickerClassId)}`;

    }
    const getCalendarProps = (): ICalendarProps => {
        return {
            ...props.calendarProps,
            styles: props.readOnly && {
                ...props.calendarProps?.styles,
                root: {
                    display: 'none'
                }
            } || props.calendarProps?.styles
        }
    };
    return (
        <div ref={ref} className={getClassNames()}>
            <DatePickerBase textField={props.textField ?? {
                borderless: props.borderless,
                readOnly: props.readOnly,
                clickToCopyProps: props.clickToCopyProps,
                deleteButtonProps: props.deleteButtonProps,
                disabled: props.disabled,
                errorMessage: props.errorMessage,
                prefixItems: props.prefixItems,
                suffixItems: props.suffixItems
            }}
                {...props} calendarProps={getCalendarProps()} className={undefined} disableAutoFocus={props.readOnly ?? props.disableAutoFocus} />
        </div>
    )
};