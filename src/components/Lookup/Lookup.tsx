
import { ILayout, ILookup, IMetadata } from "./interfaces";
import { useLookup } from "./hooks/useLookup";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ThemeProvider } from "@fluentui/react";
import { IItemProps, TagPicker } from "@talxis/react-components";
import { TargetSelector } from "./components/TargetSelector";
import { useMouseOver } from "../../hooks/useMouseOver";
import { getLookupStyles, getSuggestionsCalloutStyles } from "./styles";
import { IBasePicker } from "@fluentui/react/lib/components/pickers/BasePicker.types";
import { ITag } from "@fluentui/react/lib/components/pickers/TagPicker/TagPicker.types";
import { RecordCreator } from "./components/RecordCreator";
import { useFocusIn } from "../../hooks/useFocusIn";
import { useControlSizing } from "../../hooks/useControlSizing";
import dayjs from "dayjs";

export const Lookup = (props: ILookup) => {
    const context = props.context;
    const ref = useRef<HTMLDivElement>(null);
    const componentRef = useRef<IBasePicker<ITag>>(null);
    const itemLimit = props.parameters.MultipleEnabled?.raw === true ? Infinity : 1
    const { height } = useControlSizing(props.context.mode);
    const [value, entities, labels, records, selectEntity, getSearchResults, theme] = useLookup(props);
    const styles = getLookupStyles(theme, itemLimit === 1, height);
    const suggestionsCalloutTheme = props.context.fluentDesignLanguage?.applicationTheme ?? theme;
    const suggestionsCalloutStyles = useMemo(() => getSuggestionsCalloutStyles(suggestionsCalloutTheme), [suggestionsCalloutTheme])
    const mouseOver = useMouseOver(ref);
    const isFocused = useFocusIn(ref, 100);
    const firstRenderRef = useRef(true);
    const shouldFocusRef = useRef(false);
    const [placeholder, setPlaceholder] = useState('---');
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);


    useEffect(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }
        //@ts-ignore
        if (componentRef.current.state.suggestionsVisible) {
            //if the suggestions callout is open and the selected target changes, refresh the results
            forceSearch();
        }
    }, [entities])

    useEffect(() => {
        const onKeyPress = (ev: KeyboardEvent) => {
            if (context.mode.isControlDisabled) {
                return;
            }
            if (ev.key === 'Backspace') {
                const picker = ref.current?.querySelector('[class*="TALXIS__tag-picker__root"]');
                if ((document.activeElement === picker) && value.length === 1) {
                    records.select(undefined);
                    setTimeout(() => {
                        componentRef.current?.focusInput()
                    }, 200)
                }
            }
        }
        document.addEventListener('keydown', onKeyPress)
        return () => {
            document.removeEventListener('keydown', onKeyPress);
        }
    }, [value]);

    useEffect(() => {
        if (props.parameters.AutoFocus?.raw === true) {
            focus();
        }
    }, []);

    const focus = () => {
        if (componentRef.current?.items?.length === itemLimit) {
            const el = ref.current?.querySelector(':scope>div') as HTMLDivElement;
            el?.click();
            el?.focus();
            return;
        }
        componentRef.current?.focusInput();
    }

    const forceSearch = async () => {
        //@ts-ignore - We need to use internal methods to show and fill the suggestions on entity change
        componentRef.current.suggestionStore.updateSuggestions([]);
        //@ts-ignore - ^^same as above
        componentRef.current.setState({
            suggestionsVisible: true,
            suggestionsLoading: true,
        });
        //@ts-ignore - ^^same as above
        const results = await onResolveSuggestions(componentRef.current.input.current.value)
        //@ts-ignore - ^^same as above
        componentRef.current.updateSuggestionsList(results);
        //@ts-ignore - ^^same above
        componentRef.current.setState({
            isMostRecentlyUsedVisible: false,
            suggestionsVisible: true,
            moreSuggestionsAvailable: false,
        });
    }

    const isComponentActive = () => {
        return mouseOver || isFocused;
    }

    const getSecondaryName = (result: ComponentFramework.LookupValue & {
        entityData: {
            [key: string]: any;
        };
        layout: ILayout;
    }, metadata?: IMetadata) => {
        //polymorphic, selected all
        if (!entities.find(x => x.selected)) {
            return metadata?.DisplayName;
        }
        else {
            let text: string | undefined = result.entityData[result.layout?.Rows?.[0]?.Cells?.[1]?.Name];
            //TODO: use metadata to know if the attribute is a lookup and datetime
            //metadata are laaded prior to the search result, so we don't know what attribute to ask for when fetching metadata
            if(!text){
                //if the attribute is not found, try to get the formatted value of lookup
                text = result.entityData["_"+result.layout?.Rows?.[0]?.Cells?.[1]?.Name+"_value@OData.Community.Display.V1.FormattedValue"]
            }
            const dateRegex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/;
            if (typeof text === 'string' && text.match(dateRegex)) {
                text = props.context.formatting.formatTime(dayjs(text).toDate(), 1);
            }
            return text;
        }
    }

    const onResolveSuggestions = async (filter: string, selectedItems?: IItemProps[] | undefined): Promise<IItemProps[]> => {
        //TODO: onResolveSuggestions gets called when the record gets selected resulting in unnecessary call
        const results = await getSearchResults(filter);
        const suggestions: IItemProps[] = [];
        for (const result of results) {
            if (selectedItems?.find(x => x.key === result.id)) {
                continue;
            }
            const metadata = await entities.find(x => x.entityName === result.entityType)?.metadata;
            suggestions.push({
                key: result.id,
                text: result.name,
                secondaryText: getSecondaryName(result, metadata),
                'data-entity': result.entityType
            })
        }
        return suggestions;
    }

    const componentProps = onOverrideComponentProps({
        ref: componentRef,
        readOnly: context.mode.isControlDisabled,
        resolveDelay: 200,
        stackItems: itemLimit === 1,
        errorMessage: props.parameters.value.errorMessage,
        hideErrorMessage: !props.parameters.ShowErrorMessage?.raw,
        pickerCalloutProps: {
            layerProps: {
                eventBubblingEnabled: true
            },
            className: suggestionsCalloutStyles.suggestionsCallout,
            theme: suggestionsCalloutTheme,
        },
        inputProps: {
            placeholder: placeholder,
            onMouseEnter: () => {
                if (context.mode.isControlDisabled) {
                    return;
                }
                setPlaceholder(`${labels.placeholder()} ${props.parameters.value.attributes.DisplayName}`);
            },
            onMouseLeave: () => {
                setPlaceholder("---");
            }

        },
        pickerSuggestionsProps: {
            loadingText: labels.searching(),
            theme: suggestionsCalloutTheme,
            noResultsFoundText: labels.noRecordsFound(),
            className: suggestionsCalloutStyles.suggestionsContainer,
            // @ts-ignore
            suggestionsHeaderText: (
                <>
                    {props.parameters.IsInlineNewEnabled?.raw !== false && (
                        <RecordCreator labels={labels} entities={entities} onCreateRecord={records.create} />
                    )}
                    {props.parameters.value.attributes.Targets.length > 1 && (
                        <TargetSelector
                            labels={labels}
                            entities={entities}
                            onEntitySelected={(entityName) => {
                                selectEntity(entityName);
                            }}
                        />
                    )}
                </>
            )
        },
        transparent: itemLimit === 1,
        onChange: (items) => {
            records.select(
                items?.map((item) => {
                    return {
                        entityType: item['data-entity'],
                        id: item.key,
                        name: item.text
                    };
                })
            );
        },
        searchBtnProps: {
            key: 'search',
            iconProps: {
                iconName: 'Search'
            },
            showOnlyOnHover: true
        },
        selectedItems: value.map((lookup) => {
            return {
                key: lookup.id,
                text: lookup.name || labels.noName(),
                'data-entity': lookup.entityType,
                'data-navigation-enabled': props.parameters.EnableNavigation?.raw !== false,
                onClick: () => {
                    if (props.parameters.EnableNavigation?.raw === false) {
                        return;
                    }
                    context.navigation.openForm({
                        entityName: lookup.entityType,
                        entityId: lookup.id
                    });
                },
                deleteButtonProps:
                    isComponentActive() || itemLimit > 1
                        ? {
                            key: 'delete',
                            iconProps: {
                                iconName: 'Cancel',
                            },
                            onClick: () => {
                                shouldFocusRef.current = false;
                                records.deselect(lookup);
                                setTimeout(() => {
                                    focus();
                                }, 200);
                            }
                        }
                        : undefined
            };
        }),
        itemLimit: itemLimit,
        onEmptyResolveSuggestions: !context.mode.isControlDisabled ? (selectedItems) => onResolveSuggestions("", selectedItems as IItemProps[]) as any : undefined,
        onResolveSuggestions: onResolveSuggestions,
    });

    return (
        <ThemeProvider applyTo="none" theme={theme} className={`talxis__lookupControl ${styles.root}`} ref={ref}>
            <TagPicker {...componentProps} />
        </ThemeProvider>
    );
};