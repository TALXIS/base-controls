import { Label, Toggle } from "@fluentui/react";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";
import { useGanttService } from "../../../../context";
import { IGanttWeekendsEvents } from "../../GanttWeekends";
import { useGanttWeekendsLabels } from "../../context";

/** Whether the timeline draws weekends, as a toggle in the grid's settings callout. */
export const GanttWeekendToggle = () => {
    const weekends = useGanttService('ganttWeekends');
    const labels = useGanttWeekendsLabels();
    const rerender = useRerender();

    useEventEmitter<IGanttWeekendsEvents>(weekends?.events, 'onWeekendVisibilityChanged', rerender);

    //the callout can be open before the chart is drawn, and there is no setting to show until it is
    if (!weekends) {
        return null;
    }

    const showWeekends = weekends.isWeekendVisible();

    return (
        <>
            <Label>
                {labels.getLocalizedString('hideWeekends')}
            </Label>
            <Toggle
                checked={!showWeekends}
                onClick={() => weekends.setWeekendVisible(!showWeekends)} />
        </>
    );
};
