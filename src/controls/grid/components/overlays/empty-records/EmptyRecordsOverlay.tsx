import { useMemo } from "react";
import { EmptyRecords } from "@controls/dataset-control/components/ui/empty-records";
import { useLabels } from "@utils";
import { GRID_LABELS } from "../../../labels";
import { useGridComponents } from "../../../context";
import { getEmptyRecordsOverlayStyles } from "./styles";

/** What the grid shows while it has no rows. */
export const EmptyRecordsOverlay = () => {
    const labels = useLabels(GRID_LABELS);
    const components = useGridComponents();
    const styles = useMemo(() => getEmptyRecordsOverlayStyles(), []);

    return <EmptyRecords className={styles.emptyRecordsOverlay} message={labels.get('grid.noRecordsFound')} components={components.overlays?.emptyRecords} />;
};
