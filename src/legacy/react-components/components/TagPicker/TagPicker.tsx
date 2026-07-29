import * as React from 'react';
import { ICommandBarItemProps, IContextualMenuItem } from "@fluentui/react";
import { IPickerItemProps } from "@fluentui/react";
import { ISuggestionModel } from "@fluentui/react";
import { ISuggestionItemProps } from "@fluentui/react";
import { IButtonProps } from '@fluentui/react';
import { TagPicker as TagPickerBase } from '@fluentui/react';
import { ITag, ITagPickerProps as ITagPickerPropsBase } from '@fluentui/react/lib/Pickers';
import { CommandBarButton as CommandBarButtonBase } from '@fluentui/react/lib/Button';
import { IBasePicker, ValidationState } from '@fluentui/react';
import { CommandBar } from '../CommandBar/CommandBar';
import { useEffect } from 'react';
import { useState } from 'react';
import { Text } from '@fluentui/react'
import { IDisabled, IErrorMessage, IReadOnly } from '../../interfaces/components';
import { getSuggestionsStyles, getTagPickerStyles } from './styles';
import { useTheme } from '@fluentui/react';
import { useClassNames } from '../../hooks/useClassNames';
import { InputErrorMessage } from '../../utilities/components/InputErrorMessage/InputErrorMessage';
import { InputButtons } from '../../utilities/components/InputButtons/InputButtons';

/**  
 * Extented native `ICommandBarItemProps` (https://developer.microsoft.com/en-us/fluentui#/controls/web/commandbar#ICommandBarItemProps) interface to allow showing of buttons only when cursor hovers over the picker.
*/
export interface IItemButtonProps extends ICommandBarItemProps {
    /**  
     * Show button only when cursor hovers over the picker.
    */
    showOnlyOnHover?: boolean;
    hideInSuggestions?: boolean;
}
/**  
 * Extented native `ICommandBarItemProps `(https://developer.microsoft.com/en-us/fluentui#/controls/web/commandbar#ICommandBarItemProps) interface with additional styling options and functionality.
*/
export interface IItemProps extends ICommandBarItemProps {
    /**  
     * Classname that will be applied to an item while in suggestion's list.
    */
    suggestionClassName?: string;
    /**  
     * Additional buttons that will be shown next to the item.
    */
    buttons?: IItemButtonProps[];
    /**  
     * Props for customizing the delete button.
    */
    deleteButtonProps?: IItemButtonProps;
    /**  
     * Color will be applied on selected item background.
    */
    itemBackgroundColor?: string;

}
/**  
 * Extented native `IButtonProps` (https://developer.microsoft.com/en-us/fluentui#/controls/web/button) interface to allow showing of search button only when cursor hovers over the picker.
*/
export interface ISearchButtonProps extends ICommandBarItemProps {
    /**  
      * Show search button only when cursor hovers over the picker.
    */
    showOnlyOnHover?: boolean;
}
/**  
 * Extends native `ITagPickerProps` (https://developer.microsoft.com/en-us/fluentui#/controls/web/pickers). Changes the `ITag` interface that props use our `IItemProps`
 * interface. Also adds additional props to support extented functionality.
*/
export interface ITagPickerProps extends Omit<ITagPickerPropsBase, 'selectedItems' | 'onResolveSuggestions' | 'createGenericItem' | 'onRenderSuggestionsItem' | 'onRenderItem' | 'onItemSelected' | 'onChange' | 'ref'>,
    IDisabled, IReadOnly, IErrorMessage {
    /**  
     * Refer to https://developer.microsoft.com/en-us/fluentui#/controls/web/pickers for additional info about this prop.
    */
    onResolveSuggestions: (filter: string, selectedItems?: IItemProps[] | undefined) => IItemProps[] | PromiseLike<IItemProps[]>;
    /**  
     * Refer to https://developer.microsoft.com/en-us/fluentui#/controls/web/pickers for additional info about this prop.
    */
    createGenericItem?: ((input: string, ValidationState: ValidationState) => IItemProps | ISuggestionModel<IItemProps>) | undefined;
    /**  
     * Refer to https://developer.microsoft.com/en-us/fluentui#/controls/web/pickers for additional info about this prop.
    */
    onRenderSuggestionsItem?: ((props: IItemProps, itemProps: ISuggestionItemProps<IItemProps>) => JSX.Element) | undefined;
    /**  
     * Refer to https://developer.microsoft.com/en-us/fluentui#/controls/web/pickers for additional info about this prop.
    */
    onRenderItem?: ((props: IPickerItemProps<IItemProps>) => JSX.Element) | undefined;
    /**  
     * Refer to https://developer.microsoft.com/en-us/fluentui#/controls/web/pickers for additional info about this prop.
    */
    onItemSelected?: ((selectedItem?: IItemProps | undefined) => IItemProps | PromiseLike<IItemProps> | null) | undefined;
    /**  
     * Refer to https://developer.microsoft.com/en-us/fluentui#/controls/web/pickers for additional info about this prop.
    */
    onChange?: ((items?: IItemProps[] | undefined) => void) | undefined;
    /**  
     * Makes the selected items background transparent.
    */
    transparent?: boolean;
    /**  
    * Refer to https://developer.microsoft.com/en-us/fluentui#/controls/web/pickers for additional info about this prop.
   */
    selectedItems?: IItemProps[];
    /**  
    * If set to `true`, each item will take up the entire width of the container.
   */
    stackItems?: boolean;
    /**
     * Props for the search button.
     */
    searchBtnProps?: ISearchButtonProps;
    /**
     * If set to `true`, suggestions will stay open, if not all are selected and items are not limited to 1.
     */
    keepCalloutOpen?: boolean;
};


export const TagPicker = React.forwardRef<any, ITagPickerProps>((props, ref) => {
    const [searchBtnVisible, setSearchBtnVisibility] = useState<boolean>(true);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const componentRef = React.useRef<IBasePicker<ITag>>(null);
    const theme = useTheme();
    const userTyping = React.useRef<boolean>(false);
    const typingDebounce = React.useRef<NodeJS.Timeout | undefined>(undefined);
    const additionalParameters = (() => {
        const par = [];
        if (props.stackItems) par.push('--stack');
        if (props.transparent) par.push('--transparent');
        return par;
    })();
    const tagPickerStyles = React.useMemo(() => getTagPickerStyles(theme), [theme]);
    const classNames = useClassNames('Tag-Picker', props, additionalParameters, [tagPickerStyles.root]);
    
    React.useImperativeHandle(props.componentRef, () => {
        return componentRef.current!;
    }, []);

    const getSuggestionsClassNames = () => {
        let className = 'TALXIS__tag-picker__suggestions';
        if (props.pickerSuggestionsProps?.className) {
            className += ` ${props.pickerSuggestionsProps.className}`
        }
        return `${className} ${getSuggestionsStyles()}`;
    };

    const getCommandBarItems = (itemProps: IPickerItemProps<IItemProps>): ICommandBarItemProps[] => {
        let items: ICommandBarItemProps[] = [];
        const item = { ...itemProps.item };
        item.className = undefined;
        if (!item.buttons) {
            item.buttons = [];
        }
        item.buttons.forEach(button => {
            let className = '';
            if (button.className) {
                className = button.className
            };
            if (button.showOnlyOnHover) {
                className = `${className} hover-only`
            }
            button.className = className
        })
        items = items.concat(item.buttons);
        items.unshift(item);
        if (item.deleteButtonProps && !props.readOnly) {
            let className = '';
            if (item.deleteButtonProps.className) {
                className = item.deleteButtonProps.className
            };
            if (item.deleteButtonProps.showOnlyOnHover) {
                className = `${className} hover-only`
            }
            const deleteBtn: IItemButtonProps = {
                ...item.deleteButtonProps,
                className: className,
                onClick: (e, contextualItem) => {
                    if (item.deleteButtonProps?.onClick) {
                        item.deleteButtonProps.onClick(e, contextualItem)
                    }
                    itemProps.onRemoveItem!();
                }
            }
            items.push(deleteBtn);
        }
        return items;
    };

    const getItemBackground = (itemProps: IPickerItemProps<IItemProps>) => {
        if (itemProps.item.itemBackgroundColor) {
            return itemProps.item.itemBackgroundColor;
        }
        if (props.transparent) {
            return theme.semanticColors.inputBackground
        }
        return theme.palette.neutralLight;
    }

    const onRenderItem = (itemProps: IPickerItemProps<IItemProps>) => {
        return <InputButtons
            key={itemProps.key}
            backgroundColor={getItemBackground(itemProps)}
            buttons={getCommandBarItems(itemProps)} />
    };

    const isNotPickedItemLimitExceeded = (props: React.PropsWithChildren<ITagPickerProps>, pickedItemsLength?: number): boolean =>
        (!props.itemLimit || (props.itemLimit > 1 && pickedItemsLength !== undefined && pickedItemsLength < props.itemLimit));

    const areNotAllItemsPicked = (items: IItemProps[] | undefined) =>
        (items && componentRef.current?.items && items.length > componentRef.current.items.length);

    const onRenderSuggestionsItem = (item: IItemProps, itemProps: ISuggestionItemProps<IItemProps>) => {
        if (props.onRenderSuggestionsItem) {
            return props.onRenderSuggestionsItem(item, itemProps);
        }
        if (!item.buttons) {
            item.buttons = [];
        }
        //this is used to speed up performance when user is typing since rendering suggestions is expensive
        if (userTyping.current) {
            return <></>
        }
        return <CommandBar
            key={item.key}
            onClick={(e) => {
                // Length + 1 is there because item is not yet added when event is handled.
                if (props.keepCalloutOpen && isNotPickedItemLimitExceeded(props, componentRef.current?.items ? componentRef.current.items.length + 1 : undefined)) {
                    e.stopPropagation()
                    //@ts-ignore - internal method
                    componentRef.current.addItem(item)
                }
            }}
            title={`${item.text ?? ""}${item.secondaryText ? ` - ${item.secondaryText}` : ''}`}
            className={item.suggestionClassName || ''}
            buttonAs={(buttonProps) => getCommandBarButton(buttonProps as IItemButtonProps, true)}
            items={[]}
            farItems={[
                { ...item },
                ...item.buttons
            ]} />
    };

    const onChange = async (items?: IItemProps[] | undefined) => {
        if (props.readOnly) {
            return;
        }
        if (props.onChange) {
            props.onChange(items);
        }
        if (items?.length == props.itemLimit) {
            setSearchBtnVisibility(false);
        }
        else if (props.searchBtnProps) {
            setSearchBtnVisibility(true);
        }
        if (props.keepCalloutOpen && isNotPickedItemLimitExceeded(props, componentRef.current?.items?.length) && areNotAllItemsPicked(items)) {
            await forceOpenSuggestions(items);
        }
        if (items?.length === props.itemLimit) {
            //@ts-ignore - internal method
            componentRef.current.setState({
                isFocused: false
            })
        }
    };

    const forceOpenSuggestions = async (items?: IItemProps[]) => {
        if (!containerRef.current) {
            return;
        }
        const input = containerRef.current.querySelector('input');
        input?.focus();
        //@ts-ignore - We need to use internal methods to show and fill the suggestions on button click
        componentRef.current.suggestionStore.updateSuggestions([]);
        //@ts-ignore - internal method
        componentRef.current.setState({
            suggestionsVisible: true,
            suggestionsLoading: true,
        })
        const suggestions = await props.onResolveSuggestions(input?.value!, items || componentRef.current?.items as IItemProps[])
        //@ts-ignore - internal method
        componentRef.current.updateSuggestionsList(suggestions);
        //@ts-ignore - internal method
        componentRef.current.setState({
            isMostRecentlyUsedVisible: true,
            suggestionsVisible: true,
            moreSuggestionsAvailable: false,
        });
    };

    const onInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (props.readOnly) {
            e.stopPropagation();
            e.preventDefault();
            return;
        }
        switch (e.key) {
            case 'Enter':
                //@ts-ignore - internal prop
                if (!componentRef.current.state.suggestionsVisible) {
                    await forceOpenSuggestions();
                }
        }
    };

    const onInputBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        if (props?.inputProps?.onBlur) {
            props?.inputProps?.onBlur(e)
        }
        var isSafari = !!navigator.userAgent.match(/Version\/[\d\.]+.*Safari/);
        //temporary fix for safari because focus gets broken on safari if this function is used
        if (isSafari) {
            return;
        }
        const inp = e.target;
        //@ts-ignore - method does exist
        if (inp.createTextRange) {
            //@ts-ignore - method does exist
            var part = inp.createTextRange();
            part.move("character", 0);
            part.select();
        } else if (inp.setSelectionRange) {
            inp.setSelectionRange(0, 0);
        }
    };

    const onInputChange = (input: string) => {
        if (props.onInputChange) {
            props.onInputChange(input);
        }
        userTyping.current = true;
        clearTimeout(typingDebounce.current);
        typingDebounce.current = setTimeout(() => {
            userTyping.current = false;
            //@ts-ignore - internal method
            componentRef.current.setState({
                isMostRecentlyUsedVisible: true,
                suggestionsVisible: true,
                moreSuggestionsAvailable: false,
            });
        }, props.resolveDelay);
        return input;
    };

    const onSearchBtnClick = async (e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined, item?: IContextualMenuItem | undefined) => {
        props.searchBtnProps?.onClick?.(e);
        await forceOpenSuggestions();
    };

    useEffect(() => {
        if (!props.searchBtnProps || props.itemLimit == componentRef.current?.items?.length || props.disabled || props.readOnly) {
            setSearchBtnVisibility(false);
            return;
        }
        setSearchBtnVisibility(true);
    }, [props]);

    useEffect(() => {
        const input = containerRef.current?.querySelector('input');
        if (!input) {
            return;
        }
        if (input.clientHeight > 0) {
            containerRef.current?.style.setProperty('--input-height', `${input.clientHeight}px`);
        }
    }, [props.selectedItems]);
    return (
        <div onClick={() => {
            //@ts-ignore - internal methods
            componentRef.current.setState({
                isFocused: true
            })
            componentRef.current?.focusInput();
        }} ref={containerRef} tabIndex={-1} className={classNames}>
            <div className={tagPickerStyles.wrapper}>
                <TagPickerBase
                    {...props}
                    className={undefined}
                    ref={ref}
                    componentRef={componentRef}
                    pickerSuggestionsProps={
                        {
                            ...props.pickerSuggestionsProps,
                            className: getSuggestionsClassNames(),
                        }
                    }
                    itemLimit={props.itemLimit}
                    onChange={async (items) => await onChange(items as IItemProps[])}
                    onResolveSuggestions={props.onResolveSuggestions as any}                    
                    createGenericItem={props.createGenericItem as ((input: string, ValidationState: ValidationState) => ITag | ISuggestionModel<ITag>) | undefined}
                    onItemSelected={props.onItemSelected as ((selectedItem?: ITag | undefined) => ITag | PromiseLike<ITag> | null) | undefined}
                    inputProps={{
                        ...props.inputProps,
                        readOnly: props.readOnly,
                        placeholder: props.inputProps?.placeholder || '---',
                        onBlur: onInputBlur,
                        onKeyDown: onInputKeyDown
                    }}
                    onInputChange={onInputChange}
                    selectedItems={props.selectedItems as ITag[]}
                    onRenderItem={(item) => onRenderItem(item as IPickerItemProps<any>) as any}
                    onRenderSuggestionsItem={(item, itemProps) => onRenderSuggestionsItem(item as IItemProps, itemProps as any) as any}
                />
                {searchBtnVisible &&
                    <InputButtons buttons={props.searchBtnProps ? [{
                        ...props.searchBtnProps,
                        onClick: (e) => {
                            onSearchBtnClick(e);
                        }
                    }] : undefined} />
                }
            </div>
            <InputErrorMessage value={props.errorMessage} />
        </div>
    );
});

const getCommandBarButton = (props: IItemButtonProps, isSuggestion?: boolean) => {
    const _props = props as IButtonProps;
    //TODO: Could just skip rendering in suggestions if hideInSuggestions is enabled
    return (
        <CommandBarButtonBase href={isSuggestion ? props.href || '#' : props.href} draggable={false}
            onMouseUp={(e) => {
                e.preventDefault();
                if (_props.href) {
                    window.location.href = _props.href;
                    return;
                }
                if (_props.onClick) {
                    _props.onClick(e);
                    return;
                }
            }}
            {..._props}
            className={`${props.className || ''} ${props.hideInSuggestions && 'TALXIS__tag-picker__suggestion__btn--hidden' || ''}`}
            iconProps={{
                ...props.iconProps,
                imageProps: props.iconProps?.imageProps ? {
                    ...props.iconProps?.imageProps,
                    shouldStartVisible: true
                } : undefined
            }}
            onClick={(e) => {
                e.preventDefault();
            }}
            text={undefined}
            styles={{ icon: { color: props.iconProps?.color && props.iconProps?.color } }}
        >
            {(props.text || props.secondaryText) &&
                <div className={'TALXIS__tag-picker__suggestions__wrapper'}>
                    <Text>{props.text}</Text>
                    {props.secondaryText && isSuggestion &&
                        <Text variant='small'>{props.secondaryText}</Text>
                    }
                </div>
            }
        </CommandBarButtonBase>
    );
};

