import { EditColumnsColumnListUiComponents, IEditColumnsListColumn } from "@controls/dataset-control";
import { useCustomColumnCommands } from "../useCustomColumnCommands";

/** A shown column, with *Edit* beside *Remove* when it is a custom one. */
export const Column = (props: IEditColumnsListColumn) => {
    const { customColumns, editShownColumn } = useCustomColumnCommands();
    const isCustomColumn = customColumns.provider.getColumns().some(column => column.name === props.column.name);
    if (!isCustomColumn || !customColumns.enableCustomColumnEditing) {
        return EditColumnsColumnListUiComponents.onRenderColumn(props);
    }
    return EditColumnsColumnListUiComponents.onRenderColumn({
        ...props,
        //dnd-kit swallows the click, so the command acts on mouse up
        commands: [{ key: 'edit', iconProps: { iconName: 'Edit' }, onMouseUp: () => { editShownColumn(props.column.name); } }, ...props.commands],
    });
};
