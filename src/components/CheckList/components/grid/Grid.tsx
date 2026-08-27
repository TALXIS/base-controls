import * as React from "react";
import { GridReadyEvent } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { Grid as GridBase, IGrid } from "@components/Grid";
import { useTheme } from "@fluentui/react";
import { getClassNames } from "@utils";
import { ICheckListDatasetControl } from "../../CheckListDatasetControl";
import { CheckListGridCustomizer } from "./grid-customizer";
import { getCheckListGridStyles } from "./styles";

/** Props for the checklist's {@link Grid}. */
export interface ICheckListGridProps extends IGrid {
    datasetControl: ICheckListDatasetControl;
}

/**
 * The checklist's AG Grid instance, configured by {@link CheckListGridCustomizer}.
 *
 * This wrapper exists because the dataset control renderer strips `onOverrideComponentProps` on the way
 * through — the checklist's override on the renderer reaches the container, not AG Grid. Getting at the
 * grid's own props means overriding them here, one level down.
 */
export const Grid = (props: ICheckListGridProps) => {
    const { datasetControl, ...gridProps } = props;
    const customizerRef = React.useRef<CheckListGridCustomizer>();
    const theme = useTheme();
    const styles = React.useMemo(() => getCheckListGridStyles(theme), [theme]);

    return <GridBase {...gridProps}
        onOverrideComponentProps={(props) => {
            return {
                ...props,
                //the base grid's own className is not overridable, so the row transition is attached
                //here instead - this one lands on the ag-root-wrapper, above the animated rows
                className: getClassNames([props.className, styles.checkListGridRoot]),
                //`rowDragText` is an initial-only option, so it cannot be set from the customizer.
                //Without it the drag ghost reads "1 row"; the item's own label is more use.
                rowDragText: (params) => {
                    const record = params.rowNode?.data as IRecord | undefined;
                    return record?.getFormattedValue(datasetControl.getFieldMapping().name) ?? '';
                },
                onGridReady: (event: GridReadyEvent) => {
                    //before the base handler: it runs the grid's init, which pushes the first columns,
                    //and those need to arrive through the customizer's patched setter
                    customizerRef.current = new CheckListGridCustomizer({
                        gridApi: event.api,
                        datasetControl: datasetControl
                    });
                    props.onGridReady?.(event);
                }
            }
        }}
    />
}
