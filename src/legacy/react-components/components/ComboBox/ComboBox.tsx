import * as React from 'react';
import { IComboBoxProps as IComboBoxPropsBase, IComboBox, ComboBox as ComboBoxBase, getCommandBarStyles, useTheme, ISelectableOption, ICommandBarItemProps, PrimaryButton, TextField, Icon, ThemeProvider } from "@fluentui/react";
import { ICopyButton, IDeleteButton, IDisabled, IErrorMessage, IPrefix, IReadOnly, ISuffix } from '../../interfaces/components';
import { useClassNames } from '../../hooks/useClassNames';
import { InputButtons } from '../../utilities/components/InputButtons/InputButtons';
import { getComboBoxStyles } from './styles';
import ReactDOM from 'react-dom';

export interface IComboBoxProps extends Omit<IComboBoxPropsBase, 'errorMessage' | 'caretDownButtonStyles'>, IReadOnly,
    IErrorMessage, IDeleteButton, IDisabled, IPrefix, ISuffix, IDeleteButton, ICopyButton {
}

export const ComboBox = React.forwardRef<HTMLDivElement, IComboBoxProps>((props, ref) => {
    const componentRef = React.useRef<IComboBox>(null);
    const theme = useTheme();
    const comboBoxStyles = React.useMemo(() => getComboBoxStyles(theme), [theme]);
    const classNames = useClassNames('Combobox', props, undefined, [comboBoxStyles.root]);
    const calloutClassNames = useClassNames('Combobox__callout', { className: props.className }, undefined, [comboBoxStyles.callout]).replace('---underlined', '')

    React.useEffect(() => {
        if (props.prefixItems && props.prefixItems.length > 0) {
            renderPrefixItems();
        }
        else {
            removePrefixItems();
        }
    }, [props.prefixItems, theme]);

    React.useImperativeHandle(props.componentRef, () => {
        return componentRef.current!;
    }, []);

    const removePrefixItems = () => {
        //@ts-ignore - typings
        const parent: HTMLDivElement = componentRef.current._comboBoxWrapper.current;
        const existingContainer = parent.querySelector(':scope>.talxis-combobox__prefix-buttons');
        if (existingContainer) {
            parent.removeChild(existingContainer);
        }
    }

    const renderPrefixItems = () => {
        //@ts-ignore - typings
        const parent: HTMLDivElement = componentRef.current._comboBoxWrapper.current;
        const container = document.createElement('div');
        container.setAttribute('class', 'talxis-combobox__prefix-buttons');
        ReactDOM.render(React.createElement(ThemeProvider, {
            theme: theme,
            applyTo: 'none'
        },
            React.createElement(InputButtons, {
                buttons: props.prefixItems,
            })
        ), container)
        const existingContainer = parent.querySelector(':scope>.talxis-combobox__prefix-buttons');
        if (!existingContainer) {
            //@ts-ignore
            parent.prepend(container);
        }
        else {
            existingContainer.replaceWith(container);
        }
    }

    const onRenderSuffix = () => {
        const buttons: ICommandBarItemProps[] = [
            ...(props.suffixItems ? props.suffixItems : []),
            ...(props.readOnly ? [] : [{
                key: 'chevronDown',
                iconProps: {
                    iconName: 'ChevronDown'
                },
                onClick: () => {
                    // @ts-ignore - internal method to show combobox options
                    componentRef.current?._onComboBoxClick();
                }
            }])
        ];
        return <InputButtons
            disabled={props.disabled}
            readOnly={props.readOnly}
            buttons={buttons}
            value={props.selectedKey?.toString()}
            clickToCopyProps={getClickToCopyAndDeleteProps(props.clickToCopyProps)}
            deleteButtonProps={getClickToCopyAndDeleteProps(props.deleteButtonProps)}
        />
    }

    const getClickToCopyAndDeleteProps = (props?: ICommandBarItemProps): ICommandBarItemProps | undefined => {
        if (!props) {
            return undefined;
        }
        return {
            ...props,
            getValueToCopy: () => {
                if (props.getValueToCopy) {
                    return props.getValueToCopy();
                }
                return componentRef.current?.selectedOptions.map(option => option.text).join('; ')
            },
            onClick: (e) => {
                e?.preventDefault();
                e?.stopPropagation();
                props.onClick?.();
                componentRef.current?.focus();
            }
        }
    }

    return <ComboBoxBase
        {...props}
        ref={ref}
        componentRef={componentRef}
        className={classNames}
        autofill={{
            ...props.autofill,
            title: props.autofill?.title ?? props.options?.find(opt => opt.key == props.selectedKey)?.text,
            readOnly: props.readOnly ?? props.disabled,
            ...(props.readOnly ? { onKeyDown: () => { } } : {})
        }}
        calloutProps={{
            ...props.calloutProps,
            className: calloutClassNames,
            styles: {
                ...props.calloutProps?.styles,
                root: {
                    //@ts-ignore - root does exits
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
})
ComboBox.defaultProps = {
    placeholder: '---'
}