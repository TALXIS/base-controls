import { useMemo, useRef } from "react";
import { concatStyleSets, ICommandBar, ICommandBarProps } from "@fluentui/react";
import { useResizeObserver } from "@legacy";
import { getClassNames, IAlignment } from "@utils";
import { CellUiCommandsComponents, ICellUiCommandsComponents } from "./components";
import { getCellUiCommandsStyles } from "./styles";

export interface ICellUiCommandsProps extends ICommandBarProps {
    /** Where the buttons sit in the width the bar takes. */
    alignment?: IAlignment;
    components?: Partial<ICellUiCommandsComponents>;
}

/** The commands a cell offers, drawn to fit the row it is in. */
export const CellUiCommands = (props: ICellUiCommandsProps) => {
    const { alignment = 'left', className, items, overflowItems, components: _, ...commandBarProps } = props;
    const components = { ...CellUiCommandsComponents, ...props.components };
    const styles = useMemo(() => getCellUiCommandsStyles(alignment), [alignment]);
    const commandBarRef = useRef<ICommandBar>(null);
    const observe = useResizeObserver(() => commandBarRef.current?.remeasure());

    if (items.length === 0 && !overflowItems?.length) {
        return null;
    }

    return components.onRenderContainer({
        ref: (element: HTMLDivElement | null) => element && observe(element),
        className: getClassNames([styles.commandsRoot, className]),
        children: components.onRenderCommandBar({
            ...commandBarProps,
            items: items,
            overflowItems: overflowItems,
            componentRef: commandBarRef,
            className: styles.commandBar,
            styles: concatStyleSets({ root: styles.commandBarRoot, primarySet: styles.primarySet }, props.styles),
        }),
    });
};
