import { useGridService } from "@controls/grid/useGridService";
import { useGridComponents } from "@controls/grid/context";

/** What the grid shows while it has no rows. */
export const EmptyRecordsOverlay = () => {
    const labels = useGridService('labels');
    const components = useGridComponents();

    return components.onRenderEmptyRecordsOverlay({ message: labels.getLocalizedString('noRecordsFound') });
};
