
import { ILookup } from "./interfaces";
import { useLookup } from "./hooks/useLookup";
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from "@fluentui/react";
import { IItemProps, TagPicker } from "@talxis/react-components/dist/components/TagPicker";
import { TargetSelector } from "./components/TargetSelector";
import { useMouseOver } from "../../hooks/useMouseOver";
import { getLookupStyles } from "./styles";
import { IBasePicker } from "@fluentui/react/lib/components/pickers/BasePicker.types";
import { ITag } from "@fluentui/react/lib/components/pickers/TagPicker/TagPicker.types";
import { RecordCreator } from "./components/RecordCreator";

export const Lookup = (props: ILookup) => {
    const context = props.context;
    const ref = useRef<HTMLDivElement>(null);
    const componentRef = useRef<IBasePicker<ITag>>(null);
    const theme = useTheme();
    const styles = getLookupStyles(theme, context.mode.allocatedHeight);
    const [value, entities, labels, records, selectEntity, getSearchResults] = useLookup(props);
    const mouseOver = useMouseOver(ref);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const firstRenderRef = useRef(true);

    const itemLimit = props.parameters.MultipleEnabled?.raw === true ? Infinity : 1

    useEffect(() => {
        if (!entities) {
            return;
        }
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
                const picker = ref.current?.querySelector('[class*="TALXIS__tag-picker__root"]');
                if (document.activeElement === picker && value.length === 1) {
                    records.select(undefined);
                    setTimeout(() => {
                        componentRef.current?.focus();
                    }, 200)
                }
            }
        }
        document.addEventListener('keydown', onKeyPress)

        return () => {
            document.removeEventListener('keydown', onKeyPress);
        }
    }, []);

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
        const results = await getSearchResults(filter);
        return results.map(result => {
            return {
                key: result.id,
                text: result.name || labels.noName,
                secondaryText: entities?.find(x => x.entityName === result.entityType)?.metadata.DisplayName,
                'data-entity': result.entityType
            }
        })
    }
    return (
        <div className={styles.root} ref={ref}>
            {entities.length !== 0 &&
                <TagPicker
                    componentRef={componentRef}
                    resolveDelay={200}
                    pickerCalloutProps={{
                        className: styles.suggestions,
                    }}

                    pickerSuggestionsProps={{
                        loadingText: labels.searching,
                        noResultsFoundText: labels.noRecordsFound,

                        //@ts-ignore
                        suggestionsHeaderText: entities ? <>
                            {props.parameters.IsInlineNewEnabled?.raw !== false &&
                                <RecordCreator labels={labels} entities={entities} onCreateRecord={records.create} />
                            }
                            {props.parameters.value.attributes.Targets.length > 1 &&
                                <TargetSelector labels={labels} entities={entities} onEntitySelected={(entityName) => {
                                    selectEntity(entityName);

                                }} />
                            }
                        </> : <></>,
                    }}

                    inputProps={{
                        autoFocus: props.parameters.AutoFocus?.raw === true,
                        onFocus: () => setIsFocused(true),
                        onBlur: () => setIsFocused(false)
                    }}
                    transparent={!isComponentActive()}
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
                        iconProps: {
                            iconName: 'Search'
                        }
                    }}
                    selectedItems={value.map(lookup => {
                        return {
                            key: lookup.id,
                            text: lookup.name || labels.noName,
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

                            deleteButtonProps: {
                                key: 'delete',
                                showOnlyOnHover: true,
                                iconProps: {
                                    iconName: 'ChromeClose',
                                    styles: {
                                        root: {
                                            fontSize: 12,
                                            width: 16,
                                            color: `${theme.palette.black} !important`
                                        }
                                    }
                                }
                            }
                        }
                    })}
                    itemLimit={itemLimit}
                    onResolveSuggestions={onResolveSuggestions} />
            }
        </div>
    )
};