import React, { useEffect, useMemo } from "react";
import { InputActionMeta } from "react-select";
import { getColumnSelectorStyles } from "./styles";
import { Selector } from "../selector/Selector";
import { SelectInstance } from 'react-select';
import { Attribute, IColumn } from "@talxis/client-libraries";
import { useEditColumns, useEditColumnsLabels } from "../context";
import AsyncSelect from "react-select/async";

interface IColumnSelectorProps {
    openMenuOnMount?: boolean;
}

export const ColumnSelector = (props: IColumnSelectorProps) => {
    const { openMenuOnMount } = props;
    const model = useEditColumns();
    const labels = useEditColumnsLabels();
    const styles = useMemo(() => getColumnSelectorStyles(), []);
    const ref = React.useRef<SelectInstance>(null);
    const [defaultOptions, setDefaultOptions] = React.useState<IColumn[]>([]);
    const [inputValue, setInputValue] = React.useState<string>('');

    const onChange = (columns: IColumn[]) => {
        model.addColumn(columns[columns.length - 1]);
        setDefaultOptions([...defaultOptions]);
        setTimeout(() => {
            ref.current?.focusInput();
        }, 0);
    }

    const onInputChange = (value: string, actionMeta: InputActionMeta) => {
        switch (actionMeta.action) {
            case 'menu-close':
            case 'input-blur':
            case 'set-value': {
                value = actionMeta.prevInputValue;
                break;
            }
        }
        setInputValue(value);
        return value;
    }

    useEffect(() => {
        if (openMenuOnMount) {
            ref.current?.focus();
            ref.current?.openMenu('first');
        }
        (async () => {
            const options = await model.getAvailableColumns();
            //forces refresh of defaultOptions
            setDefaultOptions(options);
        })();
    }, []);
    

    return <Selector components={{
        Select: (props) => <AsyncSelect<IColumn, true, any>
            {...props}
            isMulti={true}
            inputValue={inputValue}
            className={styles.root}
            backspaceRemovesValue={false}
            value={model.getColumns().filter(col => !col.isHidden)}
            closeMenuOnSelect={false}
            hideSelectedOptions={true}
            defaultOptions={defaultOptions}
            placeholder={`${labels.addColumn}...`}
            controlShouldRenderValue={false}
            onInputChange={onInputChange}
            getOptionValue={(column) => Attribute.GetNameFromAlias(column.name)}
            onKeyDown={(ev) => ev.key === 'Enter' && ref.current?.openMenu('first')}
            loadOptions={(inputValue: string) => model.getAvailableColumns(inputValue)} 
            onChange={(columns) => onChange(columns as IColumn[])}
        />
    }} />

}