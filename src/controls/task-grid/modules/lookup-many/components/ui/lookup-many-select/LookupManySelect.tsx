import { useEffect, useRef } from "react";
import { useTheme } from "@fluentui/react";
import { MultiValueProps, OptionProps } from "react-select";
import type { IDataProvider } from "@talxis/client-libraries";
import { ILookupManySelectComponents, LookupManySelectComponents } from "./components";
import { LookupManySelectContext, useLookupManySelectContext } from "./context";

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
    components?: Partial<ILookupManySelectComponents>;
    onChange?: (value: Reference[]) => void;
}

//as the grid's own value renderer
const PADDING = 9;

//module level: react-select remounts a slot whose component changes
const MultiValue = (props: MultiValueProps<Reference, true, never>) => {
    const { components, onRemove } = useLookupManySelectContext();
    return components.onRenderPill({ reference: props.data, onRemove: props.isDisabled ? undefined : onRemove });
};

const Option = (props: OptionProps<Reference, true, never>) => useLookupManySelectContext().components.onRenderOption(props);

/** A multi-record picker over any provider, its picks wrapping above the records it offers. */
export const LookupManySelect = (props: ILookupManySelectProps) => {
    const components = { ...LookupManySelectComponents, ...props.components };
    const theme = useTheme();
    const value = props.value ?? [];
    const isMountedRef = useRef(true);
    useEffect(() => () => { isMountedRef.current = false; }, []);

    const loadOptions = async (query: string): Promise<Reference[]> => {
        const provider = props.dataProvider;
        if (!provider) {
            return [];
        }
        provider.setSearchQuery(query);
        const records = await provider.refresh();
        return isMountedRef.current ? records.map(record => ({ ...record.getNamedReference(), rawData: record.getRawData() }) as Reference) : [];
    };

    const onRemove = (reference: Reference) => props.onChange?.(value.filter(picked => picked.id.guid !== reference.id.guid));

    return <LookupManySelectContext.Provider value={{ components, onRemove }}>
        {components.onRenderSelect({
            isMulti: true,
            isDisabled: props.isDisabled,
            autoFocus: props.autoFocus,
            defaultInputValue: props.defaultSearchQuery,
            menuIsOpen: !props.isDisabled,
            value,
            placeholder: '',
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
            styles: {
                control: base => ({ ...base, minHeight: 0, padding: `4px ${PADDING}px`, border: 'none', borderBottom: `1px solid ${theme.palette.neutralLight}`, borderRadius: 0, background: 'none', boxShadow: 'none' }),
                valueContainer: base => ({ ...base, gap: 4, padding: 0 }),
                input: base => ({ ...base, margin: 0, padding: 0, color: theme.semanticColors.inputText }),
                menu: base => ({ ...base, position: 'static', margin: 0, boxShadow: 'none', borderRadius: 0, background: 'none' }),
                menuList: base => ({ ...base, maxHeight: 240 }),
                option: (base, state) => ({ ...base, paddingLeft: PADDING, paddingRight: PADDING, cursor: 'pointer', color: theme.semanticColors.bodyText, backgroundColor: state.isFocused ? theme.palette.neutralLighter : 'transparent' }),
                noOptionsMessage: base => ({ ...base, paddingLeft: PADDING, paddingRight: PADDING, textAlign: 'left', color: theme.semanticColors.bodySubtext }),
                loadingMessage: base => ({ ...base, paddingLeft: PADDING, paddingRight: PADDING, textAlign: 'left', color: theme.semanticColors.bodySubtext }),
            },
            components: {
                MultiValue,
                Option,
                IndicatorsContainer: () => null,
            },
        })}
    </LookupManySelectContext.Provider>;
};
