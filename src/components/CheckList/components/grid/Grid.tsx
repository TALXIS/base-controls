import * as React from "react";
import { GridReadyEvent } from "@ag-grid-community/core";
import { Grid as GridBase, IGrid } from "@components/Grid";
import { CheckListGridCustomizer } from "./grid-customizer";

/**
 * The checklist's AG Grid instance, configured by {@link CheckListGridCustomizer}.
 *
 * This wrapper exists because the dataset control renderer strips `onOverrideComponentProps` on the way
 * through — the checklist's override on the renderer reaches the container, not AG Grid. Getting at the
 * grid's own props means overriding them here, one level down.
 */
export const Grid = (props: IGrid) => {
    const customizerRef = React.useRef<CheckListGridCustomizer>();

    return <GridBase {...props}
        onOverrideComponentProps={(props) => {
            return {
                ...props,
                onGridReady: (event: GridReadyEvent) => {
                    //before the base handler: it runs the grid's init, which pushes the first columns,
                    //and those need to arrive through the customizer's patched setter
                    customizerRef.current = new CheckListGridCustomizer({
                        gridApi: event.api
                    });
                    props.onGridReady?.(event);
                }
            }
        }}
    />
}
