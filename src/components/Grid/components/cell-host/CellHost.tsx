import { useLayoutEffect, useMemo } from "react";
import { ICellRendererParams } from "@ag-grid-community/core";
import { Commands } from "../adapters/commands";
import { Control } from "../adapters/control";
import { CustomizerContext, ThemeContext } from "@fluentui/react";
import { useGridService } from "../../useGridService";
import { CellHostComponents, ICellHostComponents } from "./components";
import { GridCellContext } from "./context";
import { getCellCustomizerContext } from "./themeContexts";

export interface ICellHostProps extends ICellRendererParams {
    children?: React.ReactNode;
    components?: Partial<ICellHostComponents>;
}

/**
 * The cell everything is drawn inside.
 *
 * Creates the `GridCell` its children belong to, registers it as rendered, destroys it when it unmounts,
 * and draws the container that cell is in. A renderer, an editor or a module's own cell that does not
 * render through this has no cell, and `useGridCell` says so.
 */
export const CellHost = (props: ICellHostProps) => {
    const { data: record, children, components: componentOverrides } = props;
    const columnName = props.column!.getColId();
    const cells = useGridService('cells');
    const components = { ...CellHostComponents, ...componentOverrides };
    const cell = useMemo(() => cells.createCell(record, columnName), [cells, record, columnName]);
    const theme = cell.getTheme().getValue();

    //registered in a layout effect rather than in the render: a render React throws away must not leave a
    //cell in the registry with nothing left to unmount it
    useLayoutEffect(() => {
        cells.addCell(cell);
        return () => cells.removeCell(cell);
    }, [cells, cell]);

    //both contexts rather than a `ThemeProvider`: a v8 component reads its theme from whichever it was
    //written against - `useTheme` takes `ThemeContext`, everything built with `styled()` takes
    //`CustomizerContext` - and the provider would deep-merge a theme for every cell to hand over the same
    //two things
    return <GridCellContext.Provider value={cell}>
        <ThemeContext.Provider value={theme}>
            <CustomizerContext.Provider value={getCellCustomizerContext(theme)}>
                {components.onRenderContainer({
                    //what `applyTo='element'` painted: the cell's surface and the text on it
                    style: { backgroundColor: theme.semanticColors.bodyBackground, color: theme.semanticColors.bodyText },
                    children: cell.isLoading() ? components.onRenderLoading() : <>{children}<Cell.Control components={components.control} /><Cell.Commands components={components.commands} /></>,
                })}
            </CustomizerContext.Provider>
        </ThemeContext.Provider>
    </GridCellContext.Provider>;
};

/** The cell, with what a cell can draw of its own hanging off it: `Cell.Commands`. */
export const Cell = Object.assign(CellHost, { Commands: Commands, Control: Control });
