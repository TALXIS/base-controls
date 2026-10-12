import { useMemo } from "react";
import { EmptyRecords } from "@controls/dataset-control/components/ui/empty-records";
import { useGridService } from "../../../useGridService";
import { useGridComponents } from "../../../context";
import { getEmptyRecordsOverlayStyles } from "./styles";

/** What the grid shows while it has no rows. */
export const EmptyRecordsOverlay = () => {
    const labels = useGridService('labels');
    const components = useGridComponents();
    const styles = useMemo(() => getEmptyRecordsOverlayStyles(), []);

    return <EmptyRecords className={styles.emptyRecordsOverlay} message={labels.getLocalizedString('noRecordsFound')} components={components.overlays?.emptyRecords} />;
};
