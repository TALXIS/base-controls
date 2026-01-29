import React, { useEffect, useMemo } from "react";
import { InputActionMeta } from "react-select";
import { getColumnSelectorStyles } from "./styles";
import { useModel } from "../../useModel";
import { Selector } from "../Selector/Selector";
import { useEditColumns } from "../useEditColumns";
import { SelectInstance } from 'react-select';
import { IColumn } from "@talxis/client-libraries";

interface IColumnSelectorProps {
    openMenuOnMount?: boolean;
}


export const ColumnSelector = (props: IColumnSelectorProps) => {
    const { openMenuOnMount } = props;
    const editColumnsModel = useEditColumns();
    const styles = useMemo(() => getColumnSelectorStyles(), []);
    const model = useModel();
    const labels = model.getLabels();
    const ref = React.useRef<SelectInstance>(null);
    const [defaultOptions, setDefaultOptions] = React.useState<IColumn[]>([]);
    const [inputValue, setInputValue] = React.useState<string>('');

    const onChange = (columns: IColumn[]) => {
        editColumnsModel.addColumn(columns[columns.length - 1]);
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
        if(openMenuOnMount) {
            ref.current?.focus();
            ref.current?.openMenu('first');
        }
        (async () => {
            const options = await editColumnsModel.getAvailableColumns();
            //forces refresh of defaultOptions
            setDefaultOptions(options);
        })();
    }, []);


    return <Selector<true> onOverrideComponentProps={(props) => {
        return {
            ...props,
            ref: ref,
            isMulti: true,
            inputValue: inputValue,
            className: styles.root,
            value: editColumnsModel.getColumns(),
            closeMenuOnSelect: false,
            hideSelectedOptions: true,
            defaultOptions: defaultOptions,
            placeholder: `${labels["add-column"]()}...`,
            onInputChange: onInputChange,
            controlShouldRenderValue: false,
            loadOptions: (inputValue: string) => editColumnsModel.getAvailableColumns(inputValue),
            onChange: (columns) => onChange(columns as IColumn[]),
        }
    }} />
}