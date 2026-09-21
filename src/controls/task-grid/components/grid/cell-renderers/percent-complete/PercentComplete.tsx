import { ProgressIndicator } from "@fluentui/react";
import { Grid as GridBase, IGridCellParams } from "@controls/grid";
import * as React from "react";
import { getPercentCompleteStyles } from "./styles";

/** Control name a column's metadata sets to render as a percent-complete bar. */
export const PERCENT_COMPLETE_CONTROL_NAME = "PercentComplete";

/** Renders a numeric column as a progress bar, and edits it as a slider. */
export const PercentComplete = (props: IGridCellParams) => {
    const value: number | null = props.value;
    const styles = React.useMemo(() => getPercentCompleteStyles(), []);
    
    if (props.data.getColumnInfo(props.colDef!.colId!).ui.isLoading()) {
        return <GridBase.Cell.FieldRenderer {...props} />
    }
    return <div className={styles.root}>
        <ProgressIndicator
            barHeight={5}
            styles={{
                root: styles.progressIndicatorRoot,
                itemProgress: styles.itemProgress
            }}
            description={`${value?.toString() ?? '0'}%`}
            percentComplete={value !== null ? value / 100 : 0}
         />
    </div>
}