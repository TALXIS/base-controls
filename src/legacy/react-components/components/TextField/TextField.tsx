import { ITextField, TextField as TextFieldBase, useTheme } from "@fluentui/react";
import { ITextFieldProps as ITextFieldPropsBase } from "@fluentui/react";
import { ICopyButton, IDeleteButton, IDisabled, IErrorMessage, IPrefix, IReadOnly, ISuffix } from '../../interfaces/components';
import { useClassNames } from '../../hooks/useClassNames';
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { getTextFieldStyles } from "./styles";
import { InputButtons } from '../../utilities/components/InputButtons/InputButtons';
export interface ITextFieldProps extends Omit<ITextFieldPropsBase, 'errorMessage' | 'ref'>,
    IReadOnly, ICopyButton,
    IDeleteButton, IDisabled, IErrorMessage,
    IPrefix, ISuffix {
        value: string | undefined
};
/**  
 * TextField with support for suffix/prefix items and error messages.
 * Extends https://developer.microsoft.com/en-us/fluentui#/controls/web/textfield
*/

export const TextField = forwardRef<undefined, ITextFieldProps>((props, ref) => {
    const componentRef = useRef<ITextField>(null);
    const theme = useTheme();
    const textFieldStyles = useMemo(() => getTextFieldStyles(theme), [theme]);
    const classNames = useClassNames('TextField', props, undefined, [textFieldStyles.root]);

    useImperativeHandle(props.componentRef, () => {
        return componentRef.current!;
    }, []);

    const onRenderSuffix = (): JSX.Element | null => {
        if (props.onRenderSuffix) {
            return props.onRenderSuffix();
        }
        return <InputButtons
            readOnly={props.readOnly}
            buttons={props.suffixItems}
            clickToCopyProps={props.clickToCopyProps ? {
                ...props.clickToCopyProps,
                getValueToCopy: () => {
                    if(props.clickToCopyProps?.getValueToCopy) {
                        return props.clickToCopyProps.getValueToCopy();
                    }
                    return props.value
                },
                onClick: () => {
                    props.clickToCopyProps?.onClick?.();
                    componentRef.current?.focus();
                    componentRef.current?.setSelectionRange(0, props.value?.length ?? 0);
                }
            } : undefined}
            deleteButtonProps={props.deleteButtonProps ? {
                ...props.deleteButtonProps,
                onClick: () => {
                    props.deleteButtonProps?.onClick?.();
                    componentRef.current?.focus();
                }
            } : undefined}
            value={props.value}
            disabled={props.disabled} />
    }
    const onRenderPrefix = (): JSX.Element | null => {
        if (props.onRenderPrefix) {
            return props.onRenderPrefix();
        }
        return (
            <InputButtons
                readOnly={props.readOnly}
                buttons={props.prefixItems!}
                value={props.value}
                disabled={props.disabled} />
        );
    }
    const shouldRenderCustomAffix = (type: 'suffix' | 'prefix') => {
        let items = props.prefixItems ?? [];
        if(type === 'suffix') {
            items = props.suffixItems ?? [];
        }
        if(type === 'prefix' && (items?.length > 0 || props.onRenderPrefix)) {
            return true;
        }
        if(type === 'suffix' && (items?.length > 0 || props.clickToCopyProps || props.deleteButtonProps || props.onRenderSuffix)) {
            return true;
        }
        return false;
    }
    return (
        <TextFieldBase
            {...props}
            title={props.title ?? props.value}
            componentRef={componentRef}
            className={classNames}
            onRenderPrefix={shouldRenderCustomAffix('prefix') ? () => onRenderPrefix() : undefined}
            onRenderSuffix={shouldRenderCustomAffix('suffix') ? () => onRenderSuffix() : undefined}
        />
    )
});
TextField.defaultProps = {
    placeholder: '---',
}