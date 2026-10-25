import { useEffect, useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { useGanttModule, useGanttService } from "../../../../../context";
import { SelectionBoxLayer } from "../selection-box-layer";
import { getSelectionLayerStyles } from "./styles";

/** Styles the selected rows and bars, and draws the selection box when it is enabled. */
export const SelectionLayer = () => {
    const selection = useGanttModule('selection');
    const chart = useGanttService('chart');
    const theme = useTheme();
    const styles = useMemo(() => getSelectionLayerStyles(theme), [theme]);

    useEffect(() => {
        const root = chart?.$root;
        root?.classList.add(styles.chart);
        return () => root?.classList.remove(styles.chart);
    }, [chart, styles]);

    return selection.isSelectionBoxEnabled() ? <SelectionBoxLayer /> : null;
};
