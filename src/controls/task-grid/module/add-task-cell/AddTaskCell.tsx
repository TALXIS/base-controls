import { useMemo } from "react";
import { CommandBarButton } from "@fluentui/react";
import { getClassNames } from "@utils";
import { Grid, ICellUiCommandsComponents, IGridCellParams } from "@controls/grid";
import { getAddTaskCellStyles } from "./styles";

/** The add-task command, filling its whole cell. */
export const AddTaskCell = (props: IGridCellParams) => {
    const styles = useMemo(() => getAddTaskCellStyles(), []);
    const components = useMemo<Partial<ICellUiCommandsComponents>>(() => ({
        onRenderContainer: containerProps => <div {...containerProps} className={getClassNames([containerProps.className, styles.commands])} />,
        onRenderCommandBar: commandBarProps => <>
            {commandBarProps.items.map(item => <CommandBarButton
                key={item.key}
                className={styles.button}
                iconProps={item.iconProps}
                menuIconProps={item.menuIconProps}
                menuProps={item.subMenuProps}
                title={item.title}
                ariaLabel={item.ariaLabel}
                onClick={() => item.onClick?.()} />)}
        </>,
    }), [styles]);

    return <Grid.Cell.Root {...props}>
        <Grid.Cell.Theme>
            <Grid.Cell.Container>
                <Grid.Cell.Commands components={components} />
            </Grid.Cell.Container>
        </Grid.Cell.Theme>
    </Grid.Cell.Root>;
};
