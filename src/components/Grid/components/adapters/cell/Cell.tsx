import { useMemo } from "react";
import { ThemeProvider } from "@fluentui/react";
import { CellErrorBoundary } from "@components/error-boundary";
import { useGridControl } from "../../../useGridControl";
import { useGridService } from "../../../useGridService";
import { ICellProps } from "../../interfaces";
import { CellComponents, ICellComponents } from "./components";
import { getCellAdapterStyles } from "./styles";

export interface ICellAdapterProps extends ICellProps {
    components?: Partial<ICellComponents>;
}

/**
 * A field's cell, as AG Grid asks for it.
 *
 * Expects the column to name a field the record has. A group, a total, an action column and the checkbox
 * are not fields and are not this - each brings an adapter of its own.
 */
export const Cell = (props: ICellAdapterProps) => {
    //the slot map off, so what is left is exactly what a slot is handed
    const { components: componentOverrides, ...cellProps } = props;
    const { record, baseColumn: column } = cellProps;
    const control = useGridControl(record, column.name);
    const rows = useGridService('rows');
    const theming = useGridService('theming');
    const components = { ...CellComponents, ...componentOverrides };
    const styles = useMemo(() => getCellAdapterStyles(), []);
    const { loading, isResizable } = control.getField();
    const { theme, isCustom } = theming.getCellTheme(record, column.name);

    const cell = components.onRenderCell({
        alignment: column.alignment,
        resizeOptions: {
            resizable: isResizable,
            height: isResizable ? rows.getHeight(record) : undefined,
            onResizeEnd: height => rows.setHeight(record, height),
        },
        children: <>
            {loading && components.onRenderLoading()}
            {!loading && <CellErrorBoundary>{components.onRenderControl(cellProps)}</CellErrorBoundary>}
            {components.onRenderNotifications({ record: record, column: column })}
        </>,
    });

    if (!isCustom) {
        return cell;
    }
    //`applyTo='none'` so the provider paints nothing: the background is AG Grid's to draw
    return <ThemeProvider theme={theme} applyTo='none' className={styles.themeProvider}>{cell}</ThemeProvider>;
};
