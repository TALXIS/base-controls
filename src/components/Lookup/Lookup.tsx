
import { ILookup } from "./interfaces";
import { useLookup } from "./useLookup";
import React, { useEffect, useRef, useState } from 'react';
import { Link, PrimaryButton, TextField, useTheme } from "@fluentui/react";
import { TagPicker } from "@talxis/react-components/dist/components/TagPicker";
import { TargetSelector } from "./TargetSelector";
import { useMouseOver } from "../../hooks/useMouseOver";
import { getLookupStyles } from "./styles";
import { IBasePicker } from "@fluentui/react/lib/components/pickers/BasePicker.types";
import { ITag } from "@fluentui/react/lib/components/pickers/TagPicker/TagPicker.types";
import { useFocus } from "../../hooks/useFocus";
import { RecordCreator } from "./RecordCreator";

export const Lookup = (props: ILookup) => {
    const context = props.context;
    const ref = useRef<HTMLDivElement>(null);
    const componentRef = useRef<IBasePicker<ITag>>(null);
    const theme = useTheme();
    const styles = getLookupStyles(theme);
    const [value, entities, record, selectEntity] = useLookup(props);
    const mouseOver = useMouseOver(ref);
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const isComponentActive = () => {
        return mouseOver || isFocused;
    }

    return (
        <div className={styles.root} ref={ref}>
            <TagPicker
                componentRef={componentRef}
                pickerCalloutProps={{
                    className: styles.suggestions,
                }}
                pickerSuggestionsProps={{
                    resultsMaximumNumber: 99999999,
                    //@ts-ignore
                    suggestionsHeaderText: entities ? <>
                        <RecordCreator entities={entities} onCreateRecord={record.create} />
                        <TargetSelector entities={entities} onEntitySelected={selectEntity} />
                    </> : <></>,
                }}
                
                inputProps={{
                    onFocus: () => setIsFocused(true),
                    onBlur: () => setIsFocused(false)
                }}
                transparent={!isComponentActive()}
                selectedItems={value.map(lookup => {
                    return {
                        key: lookup.id,
                        text: lookup.name,
                        'data-entity': lookup.entityType,
                        onClick: () => {
                            context.navigation.openForm({
                                entityName: lookup.entityType
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
                            },
                            onClick: () => record.deselect(lookup)
                        }
                    }
                })}
                onEmptyResolveSuggestions={() => [{ key: 'aa', text: 'aaa' }] as any} onResolveSuggestions={() => [{
                    key: 'aa',
                    text: 'aaaa'
                }]} searchBtnProps={{
                    iconProps: {
                        iconName: 'Search'
                    }
                }} />
        </div>
    )
};