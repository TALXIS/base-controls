import React, { useEffect } from "react";
import { InputActionMeta } from "react-select";
import { getColumnSelectorStyles } from "./styles";
import { Selector } from "../selector/Selector";
import { SelectInstance } from 'react-select';
import { Attribute, IColumn } from "@talxis/client-libraries";
import { useEditColumns, useEditColumnsLabels } from "../../context";
import AsyncSelect, { AsyncProps } from "react-select/async";
import { useEventEmitter, useIsMounted } from "../../../../hooks";
import { IEditColumnsEvents } from "../../../../utils/edit-columns";
import { useRerender } from "@talxis/react-components";


const CustomAsyncSelect = (props: React.PropsWithChildren<AsyncProps<IColumn, true, any>>) => {
    const model = useEditColumns();
    const labels = useEditColumnsLabels();
    const styles = getColumnSelectorStyles();
    const ref = React.useRef<SelectInstance>(null);
    const [inputValue, setInputValue] = React.useState<string>('');
    const [defaultOptions, setDefaultOptions] = React.useState<IColumn[]>([]);
    const rerender = useRerender();

    useEventEmitter<IEditColumnsEvents>(model, 'onScopeColumnChanged', rerender);

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

    const onChange = (columns: IColumn[]) => {
        model.addColumn(columns[columns.length - 1]);
        setDefaultOptions([...defaultOptions]);
        setTimeout(() => {
            ref.current?.focusInput();
        }, 0);
    }

    useEffect(() => {
        if (isMounted()) {
            ref.current?.focus();
            ref.current?.openMenu('first');
        }
        (async () => {
            const options = await model.getAvailableColumns();
            //forces refresh of defaultOptions
            setDefaultOptions(options);
        })();

    }, [model.getScopeColumn().name]);

    const isMounted = useIsMounted();

    return <AsyncSelect<IColumn, true, any>
        {...props}
        ref={ref as any}
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
        getOptionValue={(column) => Attribute.GetNameFromAlias(column.name)}
        onKeyDown={(ev) => ev.key === 'Enter' && ref.current?.openMenu('first')}
        loadOptions={(inputValue: string) => model.getAvailableColumns(inputValue)}
        onChange={(columns) => onChange(columns as IColumn[])}
        onInputChange={onInputChange}
    />
}

export const ColumnSelector = () => {
    return <Selector components={{
        Select: CustomAsyncSelect
    }} />
}