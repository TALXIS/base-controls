import { ProgressIndicator } from "@fluentui/react";
import { Cell, ICellProps } from "../../../../../Grid/cells/cell/Cell";
import * as React from "react";
import { getPercentCompleteStyles } from "./styles";

export const PercentComplete = (props: ICellProps) => {
    const value = props.value.value;
    const formattedValue = props.valueFormatted;
    const styles = React.useMemo(() => getPercentCompleteStyles(), []);
    
    if(props.value.loading) {
        return <Cell {...props} />
    }
    return <div className={styles.root}>
        <ProgressIndicator
            barHeight={5}
            styles={{
                root: styles.progressIndicatorRoot,
                itemProgress: styles.itemProgress,
                itemDescription: styles.itemDescription
            }}
            description={formattedValue}
            percentComplete={value !== null ? value / 100 : 0}
         />
    </div>
}