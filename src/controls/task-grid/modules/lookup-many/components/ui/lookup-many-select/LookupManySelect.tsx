import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, useTheme } from "@fluentui/react";
import { MultiValueProps, OptionProps } from "react-select";
import type { IDataProvider } from "@talxis/client-libraries";
import { ILookupManySelectComponents, LookupManySelectComponents } from "./components";
import { LookupManySelectContext, useLookupManySelectContext } from "./context";
import { getLookupManySelectStyles } from "./styles";

type Reference = ComponentFramework.EntityReference;

/** Props for {@link LookupManySelect}. */
export interface ILookupManySelectProps {
    /** Searched as the user types, for the records that can be picked. */
    dataProvider?: IDataProvider;
    value?: Reference[];
    isDisabled?: boolean;
    autoFocus?: boolean;
    /** What the search starts with, such as the key that opened the picker. */
    defaultSearchQuery?: string;
    noRecordsFoundText: string;
    loadingText: string;
    /** The accessible name of a pick's remove button. */
    getRemoveText: (reference: Reference) => string;
    components?: Partial<ILookupManySelectComponents>;
    placeholder?: string;
    /** Draws as a field whose records open in a popup over the page. */
    isMenuPopup?: boolean;
    onChange?: (value: Reference[]) => void;
}

//react-select remounts a slot whose component changes
const MultiValue = (props: MultiValueProps<Reference, true, never>) => {
    const { components, onRemove, getRemoveText } = useLookupManySelectContext();
    return components.onRenderPill({ reference: props.data, onRemove: props.isDisabled ? undefined : onRemove, removeText: getRemoveText(props.data) });
};

const Option = (props: OptionProps<Reference, true, never>) => useLookupManySelectContext().components.onRenderOption(props);

/** A multi-record picker over any provider, its picks wrapping above the records it offers. */
export const LookupManySelect = (props: ILookupManySelectProps) => {
    const components = { ...LookupManySelectComponents, ...props.components };
    const theme = useTheme();
    const isMenuPopup = !!props.isMenuPopup;
    const styles = useMemo(() => getLookupManySelectStyles(theme, isMenuPopup), [theme, isMenuPopup]);
    const value = props.value ?? [];
    const isMountedRef = useRef(true);
    const [menuPortal, setMenuPortal] = useState<HTMLDivElement | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(true);
    useEffect(() => () => { isMountedRef.current = false; }, []);

    const loadOptions = async (query: string): Promise<Reference[]> => {
        const provider = props.dataProvider;
        if (!provider) {
            return [];
        }
        provider.setSearchQuery(query);
        const records = await provider.refresh();
        return isMountedRef.current ? records.map(record => ({ ...record.getNamedReference(), data: record.getRawData() }) as Reference) : [];
    };

    const onRemove = (reference: Reference) => props.onChange?.(value.filter(picked => picked.id.guid !== reference.id.guid));

    return <LookupManySelectContext.Provider value={{ components, onRemove, getRemoveText: props.getRemoveText }}>
        {/* a callout around a Fluent layer counts a pick as inside */}
        {props.isMenuPopup && <Layer><div ref={setMenuPortal} /></Layer>}
        {components.onRenderSelect({
            isMulti: true,
            isDisabled: props.isDisabled,
            autoFocus: props.autoFocus,
            defaultInputValue: props.defaultSearchQuery,
            menuIsOpen: !props.isDisabled && (!props.isMenuPopup || isMenuOpen),
            onMenuOpen: () => setIsMenuOpen(true),
            onMenuClose: () => setIsMenuOpen(false),
            menuPortalTarget: props.isMenuPopup ? menuPortal : undefined,
            openMenuOnFocus: true,
            menuPosition: props.isMenuPopup ? 'fixed' : 'absolute',
            value,
            placeholder: props.placeholder ?? '',
            isClearable: false,
            closeMenuOnSelect: false,
            backspaceRemovesValue: true,
            defaultOptions: !props.isDisabled,
            noOptionsMessage: () => props.noRecordsFoundText,
            loadingMessage: () => props.loadingText,
            getOptionValue: reference => reference.id.guid,
            getOptionLabel: reference => reference.name ?? '',
            loadOptions,
            onChange: picked => props.onChange?.([...picked]),
            styles,
            components: {
                MultiValue,
                Option,
                IndicatorsContainer: () => null,
            },
        })}
    </LookupManySelectContext.Provider>;
};
