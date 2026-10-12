import { useEffect, useMemo, useRef, useState } from "react";
import { InputActionMeta, SelectInstance } from "react-select";
import { Attribute, IColumn } from "@talxis/client-libraries";
import { EditColumnsSelector, IEditColumnsSelectorUiComponents } from "../edit-columns-selector";
import { getEditColumnsColumnSelectorUiStyles } from "./styles";

export interface IEditColumnsColumnSelectorUiProps {
    /** The columns already chosen, hidden from the options. */
    value: IColumn[];
    placeholder: string;
    noResultsText: string;
    noNameText: string;
    /** What an option's tooltip says. */
    getOptionTooltip: (column: IColumn) => string;
    openMenuOnMount?: boolean;
    onLoadOptions: (query?: string) => Promise<IColumn[]>;
    onAdd: (column: IColumn) => void;
    components?: Partial<IEditColumnsSelectorUiComponents<IColumn>>;
}

//react-select clears the typed text on these, which would end the search
const INPUT_CLEARING_ACTIONS = new Set(['menu-close', 'input-blur', 'set-value']);

/** Searches the columns that can be added, and adds the one picked. */
export const EditColumnsColumnSelector = (props: IEditColumnsColumnSelectorUiProps) => {
    const styles = useMemo(() => getEditColumnsColumnSelectorUiStyles(), []);
    const ref = useRef<SelectInstance<IColumn, true>>(null);
    const [defaultOptions, setDefaultOptions] = useState<IColumn[]>([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (props.openMenuOnMount) {
            ref.current?.focus();
            ref.current?.openMenu('first');
        }
        loadDefaultOptions();
    }, []);

    const loadDefaultOptions = async () => setDefaultOptions(await props.onLoadOptions());

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
        placeholder={props.placeholder}
        noResultsText={props.noResultsText}
        getOptionValue={column => Attribute.GetNameFromAlias(column.name)}
        getOptionLabel={column => column.displayName ?? props.noNameText}
        getOptionTooltip={props.getOptionTooltip}
        loadOptions={query => props.onLoadOptions(query)}
        onInputChange={onInputChange}
        onKeyDown={event => event.key === 'Enter' && ref.current?.openMenu('first')}
        onChange={onChange}
        components={props.components} />;
};
