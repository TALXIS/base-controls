
import { ILookup } from "./interfaces";
import { useLookup } from "./hooks/useLookup";
import React, { useEffect, useRef } from 'react';
import { useTheme } from "@fluentui/react";
import { IItemProps, TagPicker } from "@talxis/react-components/dist/components/TagPicker";
import { TargetSelector } from "./components/TargetSelector";
import { useMouseOver } from "../../hooks/useMouseOver";
import { getLookupStyles } from "./styles";
import { IBasePicker } from "@fluentui/react/lib/components/pickers/BasePicker.types";
import { ITag } from "@fluentui/react/lib/components/pickers/TagPicker/TagPicker.types";
import { RecordCreator } from "./components/RecordCreator";
import { useFocusIn } from "../../hooks/useFocusIn";
import { useComponentSizing } from "../../hooks/useComponentSizing";

export const Lookup = (props: ILookup) => {
    const context = props.context;
    const ref = useRef<HTMLDivElement>(null);
    const componentRef = useRef<IBasePicker<ITag>>(null);
    const itemLimit = props.parameters.MultipleEnabled?.raw === true ? Infinity : 1
    const theme = useTheme();
    const {height} = useComponentSizing(props.context.mode);
    const styles = getLookupStyles(theme,itemLimit === 1, height);
    const [value, entities, labels, records, selectEntity, getSearchResults] = useLookup(props);
    const mouseOver = useMouseOver(ref);
    const isFocused = useFocusIn(ref);
    const firstRenderRef = useRef(true);
    const shouldFocusRef = useRef(false);


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
            if (ev.key === 'Backspace') {
                console.log(componentRef)
                const picker = ref.current?.querySelector('[class*="TALXIS__tag-picker__root"]');
                console.log(ref.current);
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
        if(props.parameters.AutoFocus?.raw === true) {
            focus();
        }
    }, []);

    const focus = () => {
        if(componentRef.current?.items?.length === itemLimit) {
            //@ts-ignore
            ref.current?.querySelector('[class*="TALXIS__tag-picker__root"]')?.focus();
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

    const onResolveSuggestions = async (filter: string, selectedItems?: IItemProps[] | undefined): Promise<IItemProps[]> => {
        //TODO: onResolveSuggestions gets called when the record gets selected resulting in unnecessary call
        const results = await getSearchResults(filter);
        const suggestions: IItemProps[] = [];
        for(const result of results) {
            if(selectedItems?.find(x => x.key === result.id)) {
                continue;
            }
            const metadata = await entities.find(x => x.entityName === result.entityType)?.metadata;
            suggestions.push({
                key: result.id,
                text: result.name || labels.noName(),
                secondaryText: metadata?.DisplayName,
                'data-entity': result.entityType
            })
        }
        return suggestions;
    }
    return (
        <div className={styles.root} ref={ref}>
                <TagPicker
                    ref={componentRef}
                    underlined={props.parameters.Underlined?.raw}
                    readOnly={context.mode.isControlDisabled}
                    resolveDelay={200}
                    stackItems={itemLimit === 1}
                    errorMessage={props.parameters.value.errorMessage}
                    pickerCalloutProps={{
                        className: styles.suggestions,
                    }}
                    pickerSuggestionsProps={{
                        loadingText: labels.searching(),
                        noResultsFoundText: labels.noRecordsFound(),
                        //@ts-ignore
                        suggestionsHeaderText: <>
                            {props.parameters.IsInlineNewEnabled?.raw !== false &&
                                <RecordCreator labels={labels} entities={entities} onCreateRecord={records.create} />
                            }
                            {props.parameters.value.attributes.Targets.length > 1 &&
                                <TargetSelector labels={labels} entities={entities} onEntitySelected={(entityName) => {
                                    selectEntity(entityName);

                                }} />
                            }
                        </>
                    }}
                    transparent={itemLimit === 1}
                    onChange={(items) => {
                        records.select(items?.map(item => {
                            return {
                                entityType: item['data-entity'],
                                id: item.key,
                                name: item.text
                            }
                        }))
                    }}
                    searchBtnProps={{
                        key: 'search',
                        iconProps: {
                            iconName: 'Search'
                        }
                    }}
                    selectedItems={value.map(lookup => {
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
                                })
                            },

                            deleteButtonProps: isComponentActive() || itemLimit > 1 ? {
                                key: 'delete',
                                iconProps: {
                                    iconName: 'ChromeClose',
                                    styles: {
                                        root: {
                                            fontSize: 12,
                                            width: 16
                                        }
                                    }
                                },
                                onClick: () => {
                                    shouldFocusRef.current = false;
                                    records.deselect(lookup);
                                    setTimeout(() => {
                                        focus()
                                    }, 200)
                                }
                            } : undefined
                        }
                    })}
                    itemLimit={itemLimit}
                    onResolveSuggestions={onResolveSuggestions} />
        </div>
    )
};