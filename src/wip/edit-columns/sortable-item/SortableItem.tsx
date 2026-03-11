import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { IColumn } from "@talxis/client-libraries";
import { getSortableItemStyles } from "./styles";
import { useMemo } from "react";
import { useTheme, Text, ThemeProvider } from "@fluentui/react";
import { useEditColumns } from "../useEditColumns";
import { useThemeGenerator } from "@talxis/react-components";

export const SortableItem = (props: { column: IColumn }) => {
    const { column } = props;
    const { components, functions, model } = useEditColumns();
    const labels = functions.getLabels();
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column.name });
    const theme = useTheme();
    const styles = useMemo(() => getSortableItemStyles(theme), []);
    const displayName = column.displayName ?? labels['no-name'];
    const sortableItemTheme = useThemeGenerator(theme.palette.themePrimary, theme.semanticColors.buttonBackgroundPressed, theme.semanticColors.bodyText);

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