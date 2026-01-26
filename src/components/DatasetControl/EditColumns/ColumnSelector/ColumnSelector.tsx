import { IColumn } from "@talxis/client-libraries";
import { EditColumnsModel } from "../EditColumnsModel";
import AsyncSelect, { AsyncProps } from 'react-select/async';
import { GroupBase } from 'react-select';
import { MultiValueContainer } from "react-select/dist/declarations/src/components/MultiValue";
import { useModel } from "../../useModel";
import React from "react";

interface IColumnSelectorProps {
    editColumnsModel: EditColumnsModel;
}

export const ColumnSelector = (props: IColumnSelectorProps) => {
    const { editColumnsModel } = props;
    const selectProps: AsyncProps<IColumn, false, GroupBase<IColumn>> = {
        getOptionValue: (column: any) => column.name,
        getOptionLabel: (column: any) => column.displayName,
        isClearable: false,
        loadOptions: (inputValue: string) => editColumnsModel.getAvailableColumns(inputValue),
        defaultOptions: true,
        value: editColumnsModel.getColumns(),
        isMulti: true,
        onChange: (columns: IColumn[]) => editColumnsModel.addColumn(columns[columns.length - 1]),
        components: {
            MultiValueContainer: (props: any) => <React.Fragment />
        },
        styles: {
            control: (base: any) => {
                return {
                    ...base,
                    marginLeft: 15,
                    marginRight: 15,
                }
            },
        },

    } as AsyncProps<IColumn, false, GroupBase<IColumn>>;

    return <AsyncSelect {...selectProps} />
}