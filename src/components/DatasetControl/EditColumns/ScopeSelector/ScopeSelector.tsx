import { IColumn } from "@talxis/client-libraries";
import { Selector } from "../Selector/Selector";
import { useEditColumns } from "../useEditColumns";


export const ScopeSelector = () => {
    const editColumnsModel = useEditColumns();

    const getOptionLabel = (column: IColumn, displayName: string) => {
        //@ts-ignore
        if(column.entityDisplayName) {
            //@ts-ignore
            return `${displayName} (${column.entityDisplayName})`;
        }
        return displayName;
    }

    return <Selector<false> onOverrideComponentProps={(props) => {
        return {
            ...props,
            isMulti: false,
            defaultValue: editColumnsModel.getMainEntityColumn(),
            getOptionLabel: (column) => getOptionLabel(column, props.getOptionLabel!(column)),
            loadOptions: (inputValue: string) => editColumnsModel.getAvailableRelatedColumns(inputValue),
            onChange: (column) => editColumnsModel.selectRelatedEntityColumn(column!),
        }
    }} />
}