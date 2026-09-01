import { Label, Toggle } from "@fluentui/react";
import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";
import { IGanttViewStateEvents } from "../gantt-view-state";
import { useGanttLabels, useGanttViewState } from "../context";

/** The Gantt's section of the grid's settings callout: whether weekends are drawn. */
export const GanttWeekendToggle = () => {
    const viewState = useGanttViewState();
    const labels = useGanttLabels();
    const rerender = useRerender();
    const showWeekends = viewState.isWeekendVisible();

    useEventEmitter<IGanttViewStateEvents>(viewState.events, 'onShowWeekendsChanged', rerender);

    return (
        <>
            <Label>
                {labels.getLocalizedString('hideWeekends')}
            </Label>
            <Toggle
                checked={!showWeekends}
                onClick={() => viewState.showWeekend(!showWeekends)} />
        </>
    );
};
