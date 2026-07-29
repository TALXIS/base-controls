import { Callout, ICommandBarItemProps } from "@fluentui/react";
import * as React from 'react';
import { CommandBar } from '../CommandBar/CommandBar';
import { ITextFieldProps, TextField } from '../TextField/TextField';
import { areEqual, FixedSizeList as List } from 'react-window';
import { ITextField } from "@fluentui/react";
import { ICalloutProps } from "@fluentui/react";
import { Spinner } from "@fluentui/react";
import { TooltipHost } from "@fluentui/react";
import { ITooltipHostProps } from "@fluentui/react";
import { CommandBarButton as CommandBarButtonBase, IButtonProps } from "@fluentui/react";
import { getAutocompleteStyles, getCalloutStyles, getItemContainerStyles, getSuggestionsContainerStyles } from './styles';
import { Text } from "@fluentui/react";
import { useTheme } from "@fluentui/react";
import { ContextualMenuItemType } from "@fluentui/react";

interface IAutoComplete extends HTMLDivElement {
    currentIndex: number;
}

export interface ISuggestionsProps {
    /**  
    * Text shown during suggestions loading.
    * @default "loading"
    */
    loadingText?: string;
    /**  
    * Width of the suggestions container.
    * @default 300
    */
    suggestionsContainerWidth?: number | string;
    /**  
    * Height of the suggestions container.
    * The container height can be smaller than this value if not enough suggestions are present to avoid whitespace.
    * @default 300
    */
    suggestionsContainerHeight?: number | string;
    /**  
    * Height of individual rows.
    * @default 50
    */
    suggestionRowHeight?: number;
    /**  
    * Text that will be shown when no suggestions were found.
    * @default "not found"
    */
    noResultsFoundText?: string;
    /**
     * Text to be displayed in the callout when `onResolveSuggestions` throws an error.
     * @default "something went wrong"
     */
    onResolveSuggestionsErrorText?: string;
    /**  
    * Custom render function for suggestions header.
    */
    onRenderHeader?(): JSX.Element;
    /**  
    * Custom render function for suggestions footer.
    */
    onRenderFooter?(): JSX.Element;
}

export interface IAutoCompleteItemProps extends ICommandBarItemProps {
    /**  
     * Classname that will be applied to an item while in suggestion's list.
    */
    suggestionClassName?: string;
    /**  
     * Additional buttons that will be shown next to the item.
    */
    buttons?: ICommandBarItemProps[];
    /**  
     * Properties for the tooltip that shows when hovering over an item.
    */
    tooltipHostProps?: ITooltipHostProps;

}
export interface IAutoCompleteProps extends Omit<ITextFieldProps, 'value' | 'onChange'> {
    /**  
     * Currently selected item. If set, the component will become controlled.
    */
    selectedItem?: IAutoCompleteItemProps | string;
    /**  
     * Clears the input if item has been selected. Works only in uncontrolled mode, in controlled mode, you need to set the selected item text to a null value.
    */
    clearInputOnSelection?: boolean;
    /**  
     * Props that will be passed to the suggestions container.
    */
    suggestionsProps?: ISuggestionsProps;
    /**  
     * Props that will be passed to the suggestions callout.
    */
    calloutProps?: ICalloutProps;
    /**
     * The delay time in ms before resolving suggestions, which is kicked off when input has been changed. 
     * e.g. If a second input change happens within the resolveDelay time, the timer will start over. 
     * Only until after the timer completes will onResolveSuggestions be called.
     * @default 500
     */
    resolveDelay?: number;
    /**  
     * Props for the search button.
    */
    searchButtonProps?: ICommandBarItemProps;
    /**  
     * Fires when currently selected item changes. Returns the current input `string` if no suggestion was selected from the callout.
    */
    onChange?(item?: IAutoCompleteItemProps | string): void;
    /**  
     * Displays the callout on focus (on empty input) if enabled.
     * This is by default disabled to save calls of `onResolveSuggestions`.
     * @default false
    */
    showSuggestionsOnFocus?: boolean;
    /**  
     * A callback for what should happen when a person types text into the input. 
     * Returns the current input value to be used as a filter. 
     * If used in conjunction with resolveDelay this will only kick off after the delay throttle.
    */
    onResolveSuggestions: (filter?: string) => IAutoCompleteItemProps[] | PromiseLike<IAutoCompleteItemProps[]>;
    /**  
     * Function that specifies how an individual suggestion item will appear
    */
    onRenderSuggestionItem?(item: IAutoCompleteItemProps): JSX.Element;
}

const isCharacterKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values all special keys have at least two characters
    return e.key.length === 1;
}

const getItemObject = (selectedItem?: IAutoCompleteItemProps | string): IAutoCompleteItemProps | undefined => {
    if (!selectedItem) {
        return undefined;
    }
    if (typeof selectedItem === 'string' || selectedItem instanceof String) {
        return {
            key: selectedItem as string,
            text: selectedItem as string,
        }
    }
    return selectedItem;
};

const getTextFromItem = (selectedItem?: IAutoCompleteItemProps | string): string | undefined => {
    if (!selectedItem) {
        return undefined
    }
    if (typeof selectedItem === 'string' || selectedItem instanceof String) {
        return selectedItem as string;
    }
    return selectedItem.text;
}


export const Autocomplete = React.forwardRef<undefined, IAutoCompleteProps>((props, ref) => {
    const highlightedItemClass = 'TALXIS__autocomplete__callout__item--selected';
    const theme = useTheme();
    const containerRef = React.useRef<IAutoComplete>(null);
    const listContainerRef = React.createRef<HTMLDivElement>();
    const textFieldRef = React.useRef<ITextField>(null);
    const [item, setItem] = React.useState<IAutoCompleteItemProps | undefined>(getItemObject(props.selectedItem));
    const [value, setValue] = React.useState<string | undefined>(getTextFromItem(props.selectedItem));
    const [calloutVisible, setCalloutVisibility] = React.useState<boolean>(false);
    const [suggestions, setSuggestions] = React.useState<IAutoCompleteItemProps[]>([]);
    const [isSearching, setIsSearching] = React.useState<boolean>(false);
    const [showOnResolveSuggestionsErrorText, setShowOnResolveSuggestionsErrorText] = React.useState<boolean>(false);
    const debouncedSearchTerm = useDebounce(value, props.resolveDelay ?? 500);
    // Ref debouncedSearchTermRef is used to access current search term value
    // inside of Promise for comparison with previous value
    const debouncedSearchTermRef = React.useRef<string | undefined>();

    React.useImperativeHandle(props.componentRef, () => {
        return textFieldRef.current!;
    }, []);

    React.useEffect(() => {
        // new search term was debounced -> clear suggestions
        setSuggestions([]);

        debouncedSearchTermRef.current = debouncedSearchTerm;
        if (!debouncedSearchTermRef.current && !props.showSuggestionsOnFocus) {
            setCalloutVisibility(false);
        }
        else if (calloutVisible) {
            onResolveSuggestions(debouncedSearchTerm, true);
        }
    }, [debouncedSearchTerm]);

    React.useEffect(() => {
        setItem(getItemObject(props.selectedItem));
        setValue(getTextFromItem(props.selectedItem));
    }, [props.selectedItem]);

    React.useEffect(() => {
        const onScroll = () => {
            toggleCallout(false);
        };
        window.addEventListener('scroll', onScroll)
        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    const onResolveSuggestions = async (searchTerm?: string, checkSearchTerm: boolean = false): Promise<void> => {
        setShowOnResolveSuggestionsErrorText(false);

        try {
            const results = await props.onResolveSuggestions(searchTerm);
            if (checkSearchTerm) {
                if (debouncedSearchTerm === debouncedSearchTermRef.current) {
                    setIsSearching(false);
                    setSuggestions(results);
                }
            } else {
                setIsSearching(false);
                setSuggestions(results);
            }
        }
        catch {
            setIsSearching(false);
            setSuggestions([]);
            setShowOnResolveSuggestionsErrorText(true);
        }
    }

    const getClassNames = () => {
        let className = 'TALXIS__autocomplete__root';
        if (calloutVisible) {
            className += '--callout-visible'
        }
        if (props.className) {
            className += ` ${props.className}`
        }
        return `${className} ${getAutocompleteStyles()}`;
    };
    const getCalloutClassNames = () => {
        let className = 'TALXIS__autocomplete__callout'
        if (props.calloutProps?.className) {
            className += ` ${props.calloutProps.className}`
        }
        return `${className} ${getCalloutStyles(theme, props.suggestionsProps?.suggestionsContainerWidth)}`
    }

    const getSuggestionsContainerClassNames = () => {
        let className = 'TALXIS__autocomplete__callout__suggestions';
        return `${className} ${getSuggestionsContainerStyles(theme, props.suggestionsProps?.suggestionRowHeight)}`;
    }

    const checkIndex = (): boolean => {
        if (!containerRef.current) {
            return false;
        }
        if (containerRef.current.currentIndex === undefined) {
            containerRef.current.currentIndex = -1;
        }
        return true;
    }
    const clearIndex = () => {
        if (checkIndex()) {
            containerRef.current!.currentIndex = 0;  // first item is selected by default
        }
    };

    const toggleCallout = (shouldOpen: boolean, value?: string) => {
        if (props.readOnly) {
            return;
        }
        clearIndex();
        if (shouldOpen) {
            if (props.showSuggestionsOnFocus || (value && value !== '')) {
                setCalloutVisibility(true);
                return;
            }
        }
        else {
            setCalloutVisibility(false);
        }
    };

    const openCalloutAndGetSuggestions = () => {
        clearIndex();
        setSuggestions([]);
        setIsSearching(true);
        setCalloutVisibility(true);
        textFieldRef.current?.focus();
        onResolveSuggestions(value);
        return;
    }

    const onChange = (newValue?: string) => {
        // should a new search be initialized?
        if (newValue !== debouncedSearchTermRef.current) {
            toggleCallout(true, newValue);
            setIsSearching(true);
        }
        else {
            setIsSearching(false);
        }

        // propagate the change
        setValue(newValue);
        if (props.onChange) {
            props.onChange(newValue);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const highlightItem = (currentIndex: number, indexOffset: number) => {
            const isItemVisibleInCallout = (ele: HTMLElement) => {
                if (ele) {
                    const eleTop = ele.offsetTop
                    const eleBottom = eleTop + ele.clientHeight;
                    const containerTop = listContainerRef.current!.parentElement!.scrollTop;
                    const containerBottom = containerTop + listContainerRef.current!.parentElement!.clientHeight;
                    return (
                        (eleTop >= containerTop && eleBottom <= containerBottom)
                    );
                }

                return false;
            };
            containerRef.current!.currentIndex = currentIndex + indexOffset;
            let nextElement = listContainerRef.current?.querySelector(`[data-index="${currentIndex + indexOffset}"]`);
            nextElement?.classList.add(highlightedItemClass);
            nextElement?.parentElement?.querySelectorAll(':scope > div').forEach(element => {
                if (element !== nextElement) {
                    element.classList.remove(highlightedItemClass);
                }
            });
            if (!isItemVisibleInCallout(nextElement as HTMLElement)) {
                nextElement?.scrollIntoView(indexOffset == 1 ? false : true);
            }
        }
        if (!checkIndex()) {
            return;
        }
        const currentIndex = containerRef.current!.currentIndex;
        switch (e.key) {
            case 'Enter': {
                if (!calloutVisible) {
                    openCalloutAndGetSuggestions();
                    break;
                }
                if (suggestions[currentIndex]) {
                    selectItem(suggestions[currentIndex]);
                } else if (!isSearching) {
                    toggleCallout(false);
                }
                break;
            }
            case 'Tab': {
                if (suggestions[currentIndex]) {
                    selectItem(suggestions[currentIndex]);
                }
                break;
            }
            case 'ArrowUp': {
                e.preventDefault();
                if (currentIndex > 0) {
                    const nextElement = listContainerRef.current?.querySelector(`[data-index="${currentIndex - 1}"]`);
                    if (nextElement?.querySelector('.TALXIS__autocomplete__suggestion__non-selectable')) {
                        if (currentIndex > 1) highlightItem(currentIndex, -2);
                        break;
                    }
                    highlightItem(currentIndex, -1);
                }
                break;
            }
            case 'ArrowDown': {
                e.preventDefault();
                if (suggestions.length - 1 > currentIndex) {
                    const nextElement = listContainerRef.current?.querySelector(`[data-index="${currentIndex + 1}"]`);
                    if (nextElement?.querySelector('.TALXIS__autocomplete__suggestion__non-selectable')) {
                        if (suggestions.length - 2 > currentIndex) highlightItem(currentIndex, 2);
                        break;
                    }
                    highlightItem(currentIndex, 1);
                }
                break;
            }
            default: {
                if (item && isCharacterKeyPress(e)) {
                    setItem(undefined);
                }
            }
        }
    };

    const selectItem = (item: IAutoCompleteItemProps) => {
        toggleCallout(false);
        if (props.onChange) {
            props.onChange(item);
        }
        if (props.selectedItem) {
            return;
        }
        setItem(item);
        setValue(props.clearInputOnSelection ? '' : item?.text);
    };

    const getCommandBarItems = (itemProp: IAutoCompleteItemProps): ICommandBarItemProps[] => {
        let items: ICommandBarItemProps[] = [];
        const item = { ...itemProp };
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
        return items;
    };

    const onItemHover = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!checkIndex()) {
            return;
        };

        // remove highlightedIemClass from previous currentIndex
        const nextElement = listContainerRef.current?.querySelector(`[data-index="${containerRef.current!.currentIndex}"]`);
        nextElement?.classList.remove(highlightedItemClass);

        const hoveredItem = e.currentTarget;

        // set new currentIndex
        const currentIndex = hoveredItem.getAttribute('data-index')
        containerRef.current!.currentIndex = parseInt(currentIndex!);

    };
    const getSuggestionsContainerHeight = (): number | string => {
        const totalHeight = suggestions.length * (props.suggestionsProps?.suggestionRowHeight || 50);
        const maximumHeight = props.suggestionsProps?.suggestionsContainerHeight || 300;
        if (suggestions.length == 0 || isSearching) {
            return 50;
        }
        if (typeof maximumHeight === 'number') return totalHeight < maximumHeight ? totalHeight : maximumHeight;
        else return maximumHeight;
    };


    const onClearButtonClick = (e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => {
        if (props.deleteButtonProps?.onClick) {
            props.deleteButtonProps.onClick(e);
        }
        if (props.onChange) {
            props.onChange(undefined);
        }
        if (props.selectedItem) {
            return;
        }
        setValue('');
        toggleCallout(false);
        setItem(undefined);
    };
    //TODO: support suffixItems input directly as well (same as basic TextField)
    const getSuffixItems = () => {
        const onSearchBtnClick = (e: React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => {
            if (props.searchButtonProps?.onClick) {
                props.searchButtonProps.onClick(e as any);
            }
            openCalloutAndGetSuggestions();
        };
        const getSearchBtnClassNames = () => {
            let className = 'TALXIS__autocomplete__search-btn';
            if (props.searchButtonProps?.showOnlyOnHover) {
                className += '--hover-only'
            }
            if (props.className) {
                className += ` ${props.className}`
            }
            return className;
        };
        let items: ICommandBarItemProps[] = [];
        if (props.searchButtonProps && !props.readOnly) {
            items.push({
                ...props.searchButtonProps as ICommandBarItemProps,
                className: getSearchBtnClassNames(),
                onClick: (e) => onSearchBtnClick(e)
            });
        }
        if (props.suffixItems) {
            items = [...items, ...props.suffixItems]
        }
        return items;
    }

    const onDismiss = (e: Event | React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement> | undefined) => {
        if (props.calloutProps?.onDismiss) {
            props.calloutProps.onDismiss(e);
        }
        toggleCallout(false);
    };

    const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
        if (props.onBlur) {
            props.onBlur(e);
        }
        if (!item && props.onChange) {
            props.onChange(value);
        }

        toggleCallout(false)
    };

    const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>) => {
        if (props.onFocus) {
            props.onFocus(e);
        }

        if (props.showSuggestionsOnFocus && !item) {
            openCalloutAndGetSuggestions();
        }
    };

    const renderSuggestionItem = (suggestion: IAutoCompleteItemProps) => {
        if (suggestion.itemType) {
            return (
                <div className='TALXIS__autocomplete__suggestion__non-selectable'>
                    {suggestion.itemType === ContextualMenuItemType.Header &&
                        <Text className='TALXIS__autocomplete__suggestion__non-selectable__header'>{suggestion.text}</Text>
                    }
                </div>
            )
        }
        return (
            <TooltipHost
                tooltipProps={{
                    onRenderContent: () =>
                        <>
                            <Text>{suggestion.text}</Text>
                            {suggestion.secondaryText &&
                                <>
                                    <br />
                                    <Text variant='small'>{suggestion.secondaryText}</Text>
                                </>
                            }
                        </>
                }}
                {...suggestion.tooltipHostProps}
            >
                {props.onRenderSuggestionItem ?
                    props.onRenderSuggestionItem(suggestion) :
                    <CommandBar
                        items={[]}
                        buttonAs={(buttonProps) => getCommandBarButton(buttonProps)}
                        farItems={getCommandBarItems(suggestion)} />
                }
            </TooltipHost>
        )
    };
    return (
        <div className={getClassNames()} ref={containerRef}>
            <TextField
                {...props}
                value={value || ''}
                onBlur={onBlur}
                onFocus={onFocus}
                autoComplete="off"
                prefixItems={props.prefixItems}
                suffixItems={getSuffixItems()}
                componentRef={textFieldRef}
                deleteButtonProps={props.deleteButtonProps && {
                    ...props.deleteButtonProps,
                    onClick: onClearButtonClick
                }}
                onKeyDown={onKeyDown}
                onChange={(e, newValue) => onChange(newValue)}
                className={undefined} />
            {calloutVisible &&
                <Callout
                    {...props.calloutProps}
                    onMouseDown={(e) => { e.preventDefault() }}
                    onDismiss={onDismiss}
                    hidden={props.calloutProps?.hidden}
                    className={getCalloutClassNames()}
                    isBeakVisible={props.calloutProps?.isBeakVisible || false}
                    gapSpace={props.calloutProps?.gapSpace || 5}
                    target={containerRef.current}
                >
                    {props.suggestionsProps?.onRenderHeader &&
                        props.suggestionsProps.onRenderHeader()
                    }
                    {isSearching &&
                        <div className='TALXIS__autocomplete__callout__loading'>
                            <Spinner />
                            <Text variant='small'>{props.suggestionsProps?.loadingText || 'loading'}</Text>
                        </div>
                    }
                    {suggestions.length == 0 && !isSearching && !showOnResolveSuggestionsErrorText &&
                        <Text className='TALXIS__autocomplete__callout__not-found-text' variant='small'>{props.suggestionsProps?.noResultsFoundText || 'not found'}</Text>
                    }
                    {suggestions.length == 0 && !isSearching && showOnResolveSuggestionsErrorText &&
                        <Text className='TALXIS__autocomplete__callout__error-text' variant='small'>{props.suggestionsProps?.onResolveSuggestionsErrorText || 'something went wrong'}</Text>
                    }
                    <List
                        innerRef={listContainerRef}
                        height={getSuggestionsContainerHeight()}
                        className={getSuggestionsContainerClassNames()}
                        itemCount={isSearching ? 0 : suggestions.length}    // do not render suggestions until a new debouncedSearchTerm is available or previous debouncedSearchTerm is matched 
                        itemSize={props.suggestionsProps?.suggestionRowHeight || 50}
                        itemData={suggestions}
                        width={'100%'}>
                        {React.memo(({ index, style }) => {
                            // adjust current index to first selectable option; references: [@renderSuggestionItem, @clearIndex]
                            if (containerRef.current!.currentIndex === index && suggestions[index].itemType && suggestions.length - 1 > index) {
                                containerRef.current!.currentIndex = index + 1;
                            }

                            return (
                                <div
                                    style={style}
                                    className={getItemContainerStyles(suggestions[index], theme) + (index === containerRef.current?.currentIndex ? ` ${highlightedItemClass}` : '')} // highlight the first item
                                    onMouseEnter={onItemHover}
                                    data-index={index}
                                    onClick={() => selectItem(suggestions[index])}
                                >
                                    {renderSuggestionItem(suggestions[index])}
                                </div>
                            );
                        }, areEqual)}
                    </List>
                    {props.suggestionsProps?.onRenderFooter &&
                        props.suggestionsProps.onRenderFooter()
                    }
                </Callout>
            }
        </div>
    )
});

const useDebounce = (value: string | undefined, delay: number) => {
    const [debouncedValue, setDebouncedValue] = React.useState(value);
    React.useEffect(
        () => {
            const handler = setTimeout(() => {
                setDebouncedValue(value);
            }, delay);
            return () => {
                clearTimeout(handler);
            };
        },
        [value, delay]
    );
    return debouncedValue;
}

const getCommandBarButton = (props: IButtonProps) => {
    return (
        <CommandBarButtonBase
            {...props as IButtonProps}
            onClick={undefined}
            text={undefined}
        >
            <div className='TALXIS__autocomplete__suggestion__inner-content'>
                <Text block>{props.text}</Text>
                <Text block variant='small'>{props.secondaryText}</Text>
            </div>
        </CommandBarButtonBase>
    );
};