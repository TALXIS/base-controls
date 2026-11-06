import { useMemo } from "react";
import { Text } from "@fluentui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CommandBar } from "@legacy";
import { useThemeBuilder, useTheme, ThemeProvider } from "@theme";
import { IEditColumnsListColumn } from "./components";
import { getDatasetControlUiEditColumnsColumnListStyles } from "./styles";

/** One column in the list, dragged by its body. */
export const DatasetControlUiEditColumnsColumn = (props: IEditColumnsListColumn) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.column.name });
    const theme = useTheme();
    const styles = useMemo(() => getDatasetControlUiEditColumnsColumnListStyles(theme), [theme]);
    const columnTheme = useThemeBuilder({ colors: { primary: theme.palette.themePrimary, background: theme.semanticColors.buttonBackgroundPressed, text: theme.semanticColors.bodyText } });

    return <ThemeProvider
        theme={columnTheme}
        className={styles.column}
        ref={setNodeRef}
        data-column-name={props.column.name}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        {...attributes}
        {...listeners}>
        <Text title={props.text}>{props.text}</Text>
        <CommandBar styles={{ root: styles.commandBar }} items={[]} farItems={props.commands} />
    </ThemeProvider>;
};
