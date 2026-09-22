import * as React from "react";
import { useTheme } from "@fluentui/react";
import { useGridCell } from "../../../../components/cells/root/context";
import { useGridField } from "../../../../components/cells/field";
import { useGridService } from "../../../../useGridService";
import { getTotalValueStyles } from "./styles";

/** What a total reads as: what it is a total of, and the total itself. */
export const TotalValue = () => {
    const cell = useGridCell();
    const field = useGridField();
    //this cell is drawn in the row the aggregation module pinned, so the module is there
    const aggregation = useGridService('aggregation')!;
    const theme = useTheme();
    const styles = React.useMemo(() => getTotalValueStyles(theme), [theme]);
    const label = aggregation.getTotalLabel(cell.getColumnName());

    return <div className={styles.total}>
        {label && <span className={styles.label}>{label}</span>}
        <span className={styles.value}>{field?.getFormattedValue()}</span>
    </div>;
};
