import * as React from "react";
import { useEventEmitter } from "@hooks";
import { useGridService } from "../../../../useGridService";
import { useGridModule } from "../../../../useGridModule";
import { IGridGroupingEvents } from "../../GridGrouping";
import { useLabels } from "@utils";
import { GRID_GROUPING_LABELS } from "../../labels";

/** Says a selection was refused because it would load the records of too many groups. */
export const GroupSelectionLimitDialog = () => {
    const grouping = useGridModule('grouping');
    const pcfContext = useGridService('pcfContext');
    const labels = useLabels(GRID_GROUPING_LABELS);
    const [isOpen, setIsOpen] = React.useState(grouping.isGroupSelectionLimitDialogOpen());

    useEventEmitter<IGridGroupingEvents>(grouping.events, 'onGroupSelectionLimitDialogChanged', () => setIsOpen(grouping.isGroupSelectionLimitDialogOpen()));

    const openAlertDialog = async (): Promise<void> => {
        await pcfContext.navigation.openAlertDialog({
            text: labels.get('gridGrouping.groupSelectionLimitMessage', { maxGroupLoads: pcfContext.formatting.formatInteger(grouping.getMaxGroupLoadsPerSelection()) }),
            confirmButtonLabel: labels.get('gridGrouping.groupSelectionLimitConfirm'),
        });
        grouping.closeGroupSelectionLimitDialog();
    };

    React.useEffect(() => {
        if (isOpen) {
            openAlertDialog();
        }
    }, [isOpen]);

    //the host draws the dialog itself
    return null;
};
