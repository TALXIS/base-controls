import { useGridService } from "../../../useGridService";
import { useGridComponents } from "../../../context";
import { OverlayUi } from "../ui";

/** What the grid shows while it has no rows. */
export const EmptyRecordsOverlay = () => {
    const labels = useGridService('labels');
    const components = useGridComponents();

    return <OverlayUi.EmptyRecords message={labels.getLocalizedString('noRecordsFound')} components={components.overlays?.emptyRecords} />;
};
