import * as React from 'react';
import { IComboBox, ITimePickerProps as ITimePickerPropsBase, useTheme } from "@fluentui/react";
import { TimePicker as TimePickerBase } from "@fluentui/react";
import { IReadOnly, IDisabled } from '@legacy/interfaces/components';
import { useClassNames } from '@legacy/hooks/useClassNames';
import { InputButtons } from '@legacy/utilities/components/InputButtons/InputButtons';
import { getComboBoxStyles } from '../ComboBox/styles';
import { InputErrorMessage } from '@legacy/utilities/components/InputErrorMessage/InputErrorMessage';
import { ICommandBarItemProps } from '../CommandBar/CommandBar';
export interface ITimePickerProps extends ITimePickerPropsBase, IReadOnly,
    IDisabled {
}

export const TimePicker = React.forwardRef<HTMLDivElement, ITimePickerProps>((props, ref) => {
    const theme = useTheme();
    const classNames = useClassNames('TimePicker', props);
    const timePickerStyles = React.useMemo(() => getComboBoxStyles(theme), []);
    const componentRef = React.useRef<IComboBox>(null);

    React.useImperativeHandle(props.componentRef, () => {
        return componentRef.current!;
    }, []);

    const onRenderSuffix = () => {
        const butttons: ICommandBarItemProps[] = [
            {
                key: 'chevronDown',
                disabled: props.readOnly,
                iconProps: {
                    iconName: 'ChevronDown'
                },
                onClick: () => {
                    if (props.readOnly) {
                        return;
                    }
                    //@ts-ignore - internal method to show combobox options
                    componentRef.current?._onComboBoxClick();
                }
            }]
        return <InputButtons
            disabled={props.disabled}
            readOnly={props.readOnly}
            buttons={butttons}
        />
    }
    return (
        <div className={`${classNames} ${timePickerStyles.root}`}>
            <TimePickerBase
                {...props}
                ref={ref}
                componentRef={componentRef}
                autofill={{
                    ...props.autofill,
                    readOnly: props.readOnly,
                    ...(props.readOnly ? { onKeyDown: () => { } } : {})
                }}
                calloutProps={{
                    ...props.calloutProps,
                    styles: {
                        ...props.calloutProps?.styles,
                        root: {
                            //@ts-ignore - root exists
                            ...props.calloutProps?.styles?.root,
                            display: props.readOnly ? 'none' : undefined
                        }
                    }
                }}
                iconButtonProps={{
                    href: '#',
                    onClick: (e) => {
                        e.preventDefault()
                    },
                    onRenderIcon: () => onRenderSuffix()
                }}
            />
            <InputErrorMessage value={props.errorMessage} />
        </div>
    )

});
TimePicker.defaultProps = {
    placeholder: '---'
}