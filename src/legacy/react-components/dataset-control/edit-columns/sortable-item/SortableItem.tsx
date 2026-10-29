import { ThemeProvider, useLabels } from "@utils";
import { LEGACY_DATASET_CONTROL_LABELS } from "../../labels";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { IColumn } from "@talxis/client-libraries";
import { getSortableItemStyles } from "./styles";
import { useMemo } from "react";
import { useTheme, Text } from "@fluentui/react";
import { useEditColumns } from "../useEditColumns";
import { useThemeGenerator } from "@theme";

export const SortableItem = (props: { column: IColumn }) => {
    const { column } = props;
    const { model, components } = useEditColumns()
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column.name });
    const theme = useTheme();
    const styles = useMemo(() => getSortableItemStyles(theme), []);
    const labels = useLabels(LEGACY_DATASET_CONTROL_LABELS);
    const displayName = column.displayName ?? labels.get('legacyDatasetControl.noName');
    const sortableItemTheme = useThemeGenerator({ primary: theme.palette.themePrimary, background: theme.semanticColors.buttonBackgroundPressed, text: theme.semanticColors.bodyText });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <ThemeProvider theme={sortableItemTheme} className={styles.sortableItem} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Text title={displayName}>{displayName}</Text>
            <components.SortableItemCommandBar column={column} items={[]} farItems={[{
                key: 'delete',
                iconProps: {
                    iconName: 'Cancel',
                },
                //onClick gets cancelled by dnd kit if placed directly on the button, so we use onMouseUp
                onMouseUp: () => model.deleteColumn(column.name)
            }]} />
        </ThemeProvider>
    );
}