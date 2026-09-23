import * as React from "react";
import { Formatting } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { useGridService } from "../../../../useGridService";
import { IGridGroupingEvents } from "../../GridGrouping";
import { useGridGroupingLabels } from "../../useGridGroupingLabels";

/** Says a selection was refused because it would load the records of too many groups. */
export const GroupSelectionLimitDialog = () => {
    const grouping = useGridService('grouping')!;
    const pcfContext = useGridService('pcfContext');
    const labels = useGridGroupingLabels();
    const [isOpen, setIsOpen] = React.useState(grouping.isGroupSelectionLimitDialogOpen());

    useEventEmitter<IGridGroupingEvents>(grouping.events, 'onGroupSelectionLimitDialogChanged', () => setIsOpen(grouping.isGroupSelectionLimitDialogOpen()));

    const openAlertDialog = async (): Promise<void> => {
        await pcfContext.navigation.openAlertDialog({
            text: labels.getLocalizedString('groupSelectionLimitMessage', { maxGroupLoads: Formatting.Get().formatInteger(grouping.getMaxGroupLoadsPerSelection()) }),
            confirmButtonLabel: labels.getLocalizedString('groupSelectionLimitConfirm'),
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
