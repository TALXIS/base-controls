import { useEffect, useMemo, useRef, useState } from "react";
import { InputActionMeta, SelectInstance } from "react-select";
import { Attribute, IColumn } from "@talxis/client-libraries";
import { EditColumnsSelector, IEditColumnsSelectorUiComponents } from "../edit-columns-selector";
import { getEditColumnsColumnSelectorUiStyles } from "./styles";

/** Props for the picker of the column to add, as plain UI. */
export interface IEditColumnsColumnSelectorUiProps {
    /** The columns already chosen, hidden from the options. */
    value: IColumn[];
    /** Shown while nothing is typed. */
    placeholder: string;
    /** Shown when no column matches. */
    noResultsText: string;
    /** Shown while the options load. */
    loadingText: string;
    /** Stands in for a column without a name. */
    noNameText: string;
    /** What an option's tooltip says. */
    getOptionTooltip: (column: IColumn) => string;
    /** Whether the menu opens as soon as the picker mounts. */
    openMenuOnMount?: boolean;
    /** Loads the columns matching what is typed. */
    onLoadOptions: (query?: string) => Promise<IColumn[]>;
    /** Called with the column the user picked. */
    onAdd: (column: IColumn) => void;
    /** Replacements for its slots. */
    components?: Partial<IEditColumnsSelectorUiComponents<IColumn>>;
}

//react-select clears the typed text on these, which would end the search
const INPUT_CLEARING_ACTIONS = new Set(['menu-close', 'input-blur', 'set-value']);

/** Searches the columns that can be added, and adds the one picked. */
export const EditColumnsColumnSelector = (props: IEditColumnsColumnSelectorUiProps) => {
    const styles = useMemo(() => getEditColumnsColumnSelectorUiStyles(), []);
    const ref = useRef<SelectInstance<IColumn, true>>(null);
    const [defaultOptions, setDefaultOptions] = useState<IColumn[]>([]);
    const [isLoadingDefaultOptions, setIsLoadingDefaultOptions] = useState(true);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (props.openMenuOnMount) {
            ref.current?.focus();
            ref.current?.openMenu('first');
        }
        loadDefaultOptions();
    }, []);

    const loadDefaultOptions = async () => {
        setDefaultOptions(await props.onLoadOptions());
        setIsLoadingDefaultOptions(false);
    };

    const onInputChange = (value: string, meta: InputActionMeta): string => {
        const kept = INPUT_CLEARING_ACTIONS.has(meta.action) ? meta.prevInputValue : value;
        setInputValue(kept);
        return kept;
    };

    const onChange = (columns: readonly IColumn[]) => {
        props.onAdd(columns[columns.length - 1]);
        //react-select drops focus after a pick
        setTimeout(() => ref.current?.focusInput());
    };

    return <EditColumnsSelector<IColumn, true>
        ref={ref}
        className={styles.editColumnsColumnSelector}
        isMulti
        inputValue={inputValue}
        backspaceRemovesValue={false}
        value={props.value}
        closeMenuOnSelect={false}
        hideSelectedOptions
        controlShouldRenderValue={false}
        defaultOptions={defaultOptions}
        isLoading={isLoadingDefaultOptions || undefined}
        placeholder={props.placeholder}
        noResultsText={props.noResultsText}
        loadingText={props.loadingText}
        getOptionValue={column => Attribute.GetNameFromAlias(column.name)}
        getOptionLabel={column => column.displayName ?? props.noNameText}
        getOptionTooltip={props.getOptionTooltip}
        loadOptions={query => props.onLoadOptions(query)}
        onInputChange={onInputChange}
        onKeyDown={event => event.key === 'Enter' && ref.current?.openMenu('first')}
        //what the provider offers can change while the editor is open
        onMenuOpen={loadDefaultOptions}
        onChange={onChange}
        components={props.components} />;
};
