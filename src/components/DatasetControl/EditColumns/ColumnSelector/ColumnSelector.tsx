import React, { useEffect, useMemo } from "react";
import { components, InputActionMeta } from "react-select";
import { getColumnSelectorStyles } from "./styles";
import { useModel } from "../../useModel";
import { Selector } from "../Selector/Selector";
import { useEditColumns } from "../useEditColumns";
import { SelectInstance } from 'react-select';
import { IColumn } from "@talxis/client-libraries";


export const ColumnSelector = () => {
    const editColumnsModel = useEditColumns();
    const styles = useMemo(() => getColumnSelectorStyles(), []);
    const model = useModel();
    const labels = model.getLabels();
    const ref = React.useRef<SelectInstance>(null);
    const [defaultOptions, setDefaultOptions] = React.useState<IColumn[]>([]);

    const onChange = (columns: IColumn[]) => {
        editColumnsModel.addColumn(columns[columns.length - 1]);
        setDefaultOptions([...defaultOptions]);
        setTimeout(() => {
            ref.current?.focusInput();
        }, 0);
    }

    const onInputChange = (value: string, actionMeta: InputActionMeta) => {
        if(actionMeta.action === 'set-value') {
            return actionMeta.prevInputValue;
        }
        else {
            return value;
        }
    }

    useEffect(() => {
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
            className: styles.root,
            value: editColumnsModel.getColumns(),
            closeMenuOnSelect: false,
            onInputChange: onInputChange,
            defaultOptions: defaultOptions,
            loadOptions: (inputValue: string) => editColumnsModel.getAvailableColumns(inputValue),
            onChange: (columns) => onChange(columns as IColumn[]),
            components: {
                ...props.components,
                MultiValueContainer: (props) => <React.Fragment />,
                Input: (props) => <components.Input {...props} placeholder={`${labels["add-column"]()}...`} />
            }
        }
    }} />
}