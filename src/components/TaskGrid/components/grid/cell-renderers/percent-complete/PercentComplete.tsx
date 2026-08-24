import { ProgressIndicator } from "@fluentui/react";
import { Cell, ICellProps } from "@components/Grid/cells/cell/Cell";
import * as React from "react";
import { getPercentCompleteStyles } from "./styles";

/** Control name a column's metadata sets to render as a percent-complete bar. */
export const PERCENT_COMPLETE_CONTROL_NAME = "PercentComplete";

/** Renders a numeric column as a progress bar, and edits it as a slider. */
export const PercentComplete = (props: ICellProps) => {
    const value: number | null = props.value.value;
    const styles = React.useMemo(() => getPercentCompleteStyles(), []);
    
    if(props.value.loading) {
        return <Cell {...props} />
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