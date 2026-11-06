import { useMemo } from "react";
import { DatasetControlUiEmptyState } from "@controls/dataset-control/ui/empty-state";
import { useLabels } from "@labels";
import { GRID_LABELS } from "../../../labels";
import { useGridComponents } from "../../../context";
import { getEmptyStateOverlayStyles } from "./styles";

/** What the grid shows while it has no rows. */
export const EmptyStateOverlay = () => {
    const labels = useLabels(GRID_LABELS);
    const components = useGridComponents();
    const styles = useMemo(() => getEmptyStateOverlayStyles(), []);

    return <DatasetControlUiEmptyState className={styles.emptyStateOverlay} message={labels.get('grid.noRecordsFound')} components={components.overlays?.emptyState} />;
};
