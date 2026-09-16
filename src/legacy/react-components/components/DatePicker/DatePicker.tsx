
import * as React from 'react';
import { DatePicker as DatePickerBase, ICommandBarItemProps, IDatePicker } from "@fluentui/react";
import { IReadOnly, IErrorMessage, IDisabled, IDeleteButton, IFillAvailableSpace, ISuffix, IPrefix, ICopyButton } from '@legacy/interfaces/components';
import { useTheme } from "@fluentui/react";
import { IDatePickerProps as IDatePickerPropsBase } from "@fluentui/react";
import { getDatePickerStyles } from './styles';
import { InputButtons } from '@legacy/utilities/components/InputButtons/InputButtons';
import { PASSWORD_MANAGER_IGNORE_PROPS } from '@legacy/utilities/passwordManagerProps';
import { ITheme } from '@legacy/utilities';
import { useClassNames } from '@legacy/hooks/useClassNames';


export interface IDatePickerProps extends IDatePickerPropsBase, IReadOnly,
    IErrorMessage, IDisabled, IDeleteButton, ISuffix, IPrefix, ICopyButton, IDeleteButton, IFillAvailableSpace {
    keepCalendarOpenAfterDaySelect?: boolean;
    onSelectDate: (date: Date | null | undefined) => void;
    value: Date | undefined;
}

export const DatePicker = React.forwardRef<HTMLDivElement, IDatePickerProps>((props, ref) => {
    const theme: ITheme = useTheme();
    const componentRef = React.useRef<IDatePicker>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    //the element rather than a `componentRef`: Fluent hands its own text field a ref and spreads the
    //caller's props over it, so a ref passed here replaces the one its `focus()` reaches for
    const getInput = () => containerRef.current?.querySelector('input');
    const datePickerStyles = React.useMemo(() => getDatePickerStyles(theme), []);
    const classNames = useClassNames('DatePicker', props, [], [datePickerStyles.root]);
    const calloutClassNames = useClassNames('DatePicker__Callout', {className: props.className}, []).replace('---underlined', '')

    React.useImperativeHandle(props.componentRef, () => {
        return componentRef.current!;
    }, []);
    React.useImperativeHandle(ref, () => {
        return containerRef.current!
    })

    const onRenderSuffix = (): JSX.Element | null => {
        if (props.textField?.onRenderSuffix) {
            return props.textField?.onRenderSuffix?.();
        }
        const buttons: ICommandBarItemProps[] = [
            ...(props.suffixItems ? props.suffixItems : []),
            ...(props.readOnly ? [] : [{
                key: 'calendar',
                disabled: props.readOnly,
                iconProps: {
                    iconName: 'Calendar'
                },
                onClick: () => {
                    componentRef.current?.showDatePickerPopup();
                }
            }])
        ];
        return <InputButtons
            buttons={buttons}
            readOnly={props.readOnly}
            clickToCopyProps={props.clickToCopyProps ? {
                ...props.clickToCopyProps,
                getValueToCopy: () => {
                    if(props.clickToCopyProps?.getValueToCopy) {
                        return props.clickToCopyProps.getValueToCopy();
                    }
                    return getInput()?.value
                },
                onClick: () => {
                    props.clickToCopyProps?.onClick?.();
                    const input = getInput();
                    input?.focus();
                    input?.setSelectionRange(0, input.value.length);
                }
            } : undefined}
            deleteButtonProps={props.deleteButtonProps ? {
                ...props.deleteButtonProps,
                onClick: () => {
                    props.deleteButtonProps?.onClick?.();
                    getInput()?.focus();
                }
            } : undefined}
            value={props.value?.toString()}
            disabled={props.disabled} />
    }

    const onRenderPrefix = (): JSX.Element | null => {
        if (props.textField?.onRenderPrefix) {
            return props.textField?.onRenderPrefix();
        }
        return (
            <InputButtons
                readOnly={props.readOnly}
                buttons={props.prefixItems!}
                disabled={props.disabled} />
        );
    }

    const tempDisableUnderlineAnimation = () => {
        if (!theme.effects.underlined) {
            return;
        }
        containerRef.current?.style.setProperty('--animDuration', '0s');
        setTimeout(() => {
            containerRef.current?.style.setProperty('--animDuration', '0.2s');
        }, 300);
    }

    const animDecorator = (fn?: (...args: any) => void, ...args: any) => {
        tempDisableUnderlineAnimation();
        return fn?.(...args);
    }

    const onClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
        props.onClick?.(e);
        if (!containerRef.current?.classList.contains('is-open')) {
            return;
        }
        tempDisableUnderlineAnimation();
    }

    return (
        <DatePickerBase
            {...props}
            ref={containerRef}
            onClick={onClick}
            className={classNames}
            componentRef={componentRef}
            openOnClick={props.readOnly ? false : props.openOnClick}
            disableAutoFocus={props.readOnly ? true : props.disableAutoFocus}
            calloutProps={{
                ...props.calloutProps,
                className: calloutClassNames,
                onRestoreFocus: (e) => animDecorator(props.calloutProps?.onRestoreFocus, e),
                styles: {
                    ...props.calloutProps?.styles,
                    root: {
                        //@ts-ignore - root does exists
                        ...props.calloutProps?.styles?.root,
                        display: props.readOnly ? 'none' : undefined
                    }
                }
            }}
            calendarProps={{
                ...props.calendarProps,
                onDismiss: () => {
                    animDecorator(props.calendarProps?.onDismiss);
                },
                calendarDayProps: props.keepCalendarOpenAfterDaySelect ? {
                    onSelectDate: (date, selectedDateRangeArray) => {
                        props.calendarProps?.onSelectDate?.(date, selectedDateRangeArray);
                        props.onSelectDate?.(date)
                    }
                } : props.calendarProps?.calendarDayProps,
                onSelectDate: (date: Date, selectedDateRangeArray?: Date[] | undefined) => {
                    animDecorator(props.calendarProps?.onSelectDate, date, selectedDateRangeArray);
                    props.onSelectDate?.(date)
                }
            }}
            textField={{
                ...PASSWORD_MANAGER_IGNORE_PROPS,
                ...props.textField,
                readOnly: props.readOnly,
                errorMessage: props.errorMessage,
                onRenderPrefix: onRenderPrefix,
                onRenderSuffix: onRenderSuffix,
            }} />
    )
});

DatePicker.defaultProps = {
    placeholder: '---',
}