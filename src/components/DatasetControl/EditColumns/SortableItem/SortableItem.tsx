import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { IColumn } from "@talxis/client-libraries";
import { getSortableItemStyles } from "./styles";
import { useMemo } from "react";
import { useTheme, Text, IconButton } from "@fluentui/react";
import { useModel } from "../../useModel";
import { useEditColumns } from "../useEditColumns";

export const SortableItem = (props: { column: IColumn }) => {
    const { column} = props;
    const editColumnsModel = useEditColumns();
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column.name });
    const theme = useTheme();
    const styles = useMemo(() => getSortableItemStyles(theme), []);
    const labels = useModel().getLabels();
    const displayName = column.displayName ?? labels['no-name']();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div className={styles.sortableItem} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Text title={displayName}>{displayName}</Text>
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