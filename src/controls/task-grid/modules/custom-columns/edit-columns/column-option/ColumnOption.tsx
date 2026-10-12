import { useMemo } from "react";
import { IconButton } from "@fluentui/react";
import { IColumn } from "@talxis/client-libraries";
import { EditColumnsSelectorUiComponents, IEditColumnsSelectorOptionProps } from "@controls/dataset-control";
import { useCustomColumnCommands } from "../useCustomColumnCommands";
import { getColumnOptionStyles } from "./styles";

/** A column in the picker, with *Edit* and *Delete* after the name of a custom one. */
export const ColumnOption = (props: IEditColumnsSelectorOptionProps<IColumn>) => {
    const styles = useMemo(() => getColumnOptionStyles(), []);
    const { customColumns, editColumn, deleteColumn } = useCustomColumnCommands();
    const isCustomColumn = customColumns.provider.getColumns().some(column => column.name === props.option.name);

    //the picker selects an option on click
    const run = (event: React.MouseEvent<unknown>, command: (columnName: string) => Promise<void>) => {
        event.stopPropagation();
        event.preventDefault();
        command(props.option.name);
    };

    return <div className={styles.columnOption}>
        <div className={styles.text}>{EditColumnsSelectorUiComponents.onRenderOption(props)}</div>
        {isCustomColumn && customColumns.enableCustomColumnEditing &&
            <IconButton className={styles.button} iconProps={{ iconName: 'Edit' }} onClick={event => run(event, editColumn)} />}
        {isCustomColumn && customColumns.enableCustomColumnDeletion &&
            <IconButton className={styles.button} iconProps={{ iconName: 'Delete' }} onClick={event => run(event, deleteColumn)} />}
    </div>;
};
