import { EditColumnsModel } from "../EditColumnsModel";
import React, { useMemo } from "react";
import { components } from "react-select";
import { getColumnSelectorStyles } from "./styles";
import { useModel } from "../../useModel";
import { Selector } from "../Selector/Selector";

interface IColumnSelectorProps {
    editColumnsModel: EditColumnsModel;
}

export const ColumnSelector = (props: IColumnSelectorProps) => {
    const { editColumnsModel } = props;
    const styles = useMemo(() => getColumnSelectorStyles(), []);
    const model = useModel();
    const labels = model.getLabels();

    return <Selector<true> onOverrideComponentProps={(props) => {
        return {
            ...props,
            isMulti: true,
            className: styles.root,
            value: editColumnsModel.getColumns(),
            loadOptions: (inputValue: string) => editColumnsModel.getAvailableColumns(inputValue),
            onChange: (columns) => editColumnsModel.addColumn(columns[columns.length - 1]),
            components: {
                MultiValueContainer: (props) => <React.Fragment />,
                Input: (props) => <components.Input {...props} placeholder={`${labels["add-column"]()}...`} />
            }
        }
    }} />
}