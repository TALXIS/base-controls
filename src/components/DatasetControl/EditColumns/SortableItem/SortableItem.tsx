import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { IColumn } from "@talxis/client-libraries";
import { getSortableItemStyles } from "./styles";
import { useMemo, useRef } from "react";
import { useTheme, Text, IconButton } from "@fluentui/react";
import { EditColumnsModel } from "../EditColumnsModel";

export const SortableItem = (props: { column: IColumn, editColumnsModel: EditColumnsModel }) => {
    const { column, editColumnsModel } = props;
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column.name });
    const theme = useTheme();
    const styles = useMemo(() => getSortableItemStyles(theme), []);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div className={styles.sortableItem} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Text title={column.displayName}>{column.displayName}</Text>
                <IconButton
                    //onClick gets cancelled by dnd kit if placed directly on the button, so we use onMouseUp
                    onMouseUp={() => editColumnsModel.deleteColumn(column.name)}
                    iconProps={{
                        iconName: 'Delete'
                    }}
                />
        </div>
    );
}