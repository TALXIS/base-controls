import { useMemo } from "react";
import { Text, useTheme } from "@fluentui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CommandBar } from "@legacy";
import { useThemeGenerator } from "@theme";
import { ThemeProvider } from "@utils";
import { IEditColumnsListColumn } from "./components";
import { getEditColumnsColumnListUiStyles } from "./styles";

/** One column in the list, dragged by its body. */
export const EditColumnsColumn = (props: IEditColumnsListColumn) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.column.name });
    const theme = useTheme();
    const styles = useMemo(() => getEditColumnsColumnListUiStyles(theme), [theme]);
    const columnTheme = useThemeGenerator({ primary: theme.palette.themePrimary, background: theme.semanticColors.buttonBackgroundPressed, text: theme.semanticColors.bodyText });

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
