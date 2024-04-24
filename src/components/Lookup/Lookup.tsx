
import { ILookup } from "./interfaces";
import { useLookup } from "./hooks/useLookup";
import React, { useEffect, useRef, useState } from 'react';
import { TagPicker, useTheme } from "@fluentui/react";
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
    const styles = getLookupStyles(theme);
    const [value, entities, labels, records, selectEntity, getSearchResults] = useLookup(props);
    const mouseOver = useMouseOver(ref);
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const firstRenderRef = useRef(true);

    const itemLimit = props.parameters.MultipleEnabled?.raw === true ? 10 : 1

    useEffect(() => {
        if(!entities) {
            return;
        }
        if(firstRenderRef.current) {
            firstRenderRef.current = false;
            return;
        }
        //@ts-ignore
        if(componentRef.current.state.suggestionsVisible) {
            //if the suggestions callout is open and the selected target changes, refresh the results
            forceSearch();
        }
    }, [entities])

    useEffect(() => {
        const onKeyPress = (ev: KeyboardEvent) => {
            if(ev.key === 'Backspace') {
                const picker = ref.current?.querySelector('[class*="TALXIS__tag-picker__root"]');
                if(document.activeElement === picker && value.length === 1) {
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
    //@ts-ignore
    const onResolveSuggestions = async (filter: string, selectedItems?: IItemProps[] | undefined): Promise<IItemProps[]> => {
        const results = await getSearchResults(filter);
        return results.map(result => {
            return {
                key: result.id,
                name: result.name || labels.noName,
                secondaryText: entities?.find(x => x.entityName === result.entityType)?.metadata.DisplayName,
                'data-entity': result.entityType
            }
        })
    }
    return (
        <div className={styles.root} ref={ref}>
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
                        <RecordCreator labels={labels} entities={entities} onCreateRecord={records.create} />
                        <TargetSelector labels={labels} entities={entities} onEntitySelected={(entityName) => {
                            selectEntity(entityName);

                        }} />
                    </> : <></>,
                }}
                
                inputProps={{
                    autoFocus: props.parameters.AutoFocus?.raw === true,
                    style: itemLimit === 1 && value.length === 1 ? {visibility: 'hidden', width: 0} : undefined,
                    onFocus: () => setIsFocused(true),
                    onBlur: () => setIsFocused(false)
                }}
                transparent={!isComponentActive()}
                onChange={(items) => {
                    records.select(items?.map(item => {
                        return {
                            //@ts-ignore
                            entityType: item['data-entity'],
                            id: item.key as string,
                            name: item.name
                        }
                    }))
                }}
                searchBtnProps={{
                    showOnlyOnHover: true,
                    iconProps: {
                        iconName: 'Search'
                    }
                }}
                selectedItems={value.map(lookup => {
                    return {
                        key: lookup.id,
                        name: lookup.name || labels.noName,
                        'data-entity': lookup.entityType,
                        onClick: () => {
                            context.navigation.openForm({
                                entityName: lookup.entityType,
                                entityId: lookup.id
                            })
                        },
                        
                        deleteButtonProps: {
                            key: 'delete',
                            showOnlyOnHover: isFocused ? false : true,
                            iconProps: {
                                iconName: 'ChromeClose',
                                styles: {
                                    root: {
                                        fontSize: 12,
                                        color: `${theme.palette.black} !important`
                                    }
                                }
                            }
                        }
                    }
                })}
                onResolveSuggestions={onResolveSuggestions} />
        </div>
    )
};