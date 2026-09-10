import { ProgressIndicator } from "@fluentui/react";
import { FieldCellAdapter, IGridCellProps } from "@components/Grid";
import * as React from "react";
import { getPercentCompleteStyles } from "./styles";

/** Control name a column's metadata sets to render as a percent-complete bar. */
export const PERCENT_COMPLETE_CONTROL_NAME = "PercentComplete";

/** Renders a numeric column as a progress bar, and edits it as a slider. */
export const PercentComplete = (props: IGridCellProps) => {
    const value: number | null = props.value;
    const styles = React.useMemo(() => getPercentCompleteStyles(), []);
    
    if (props.record.getColumnInfo(props.baseColumn.name).ui.isLoading()) {
        return <FieldCellAdapter {...props} />
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