import { EditColumnsModel } from "../EditColumnsModel";
import { Selector } from "../Selector/Selector";

interface IScopeSelectorProps {
    editColumnsModel: EditColumnsModel;
}

export const ScopeSelector = (props: IScopeSelectorProps) => {
    const { editColumnsModel } = props;

    return <Selector<false> onOverrideComponentProps={(props) => {
        return {
            ...props,
            isMulti: false,
            defaultValue: editColumnsModel.getMainEntityColumn(),
            loadOptions: (inputValue: string) => editColumnsModel.getAvailableRelatedColumns(inputValue),
            onChange: (column) => editColumnsModel.selectRelatedEntityColumn(column!),

        }
    }} />
}