import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";
import { useTaskDataProvider } from "@components/TaskGrid/context";
import { ZoomSlider } from "@components/zoom-slider";
import { IGanttViewStateEvents } from '../gantt-view-state';
import { useGanttLabels, useGanttViewState } from "../context";

/** The timeline's zoom, as the slider the header renders left of the ribbon. */
export const ZoomSliderAdapter = () => {
    const provider = useTaskDataProvider();
    const viewState = useGanttViewState();
    const labels = useGanttLabels();
    const value = viewState.getZoomLevel() ?? 0;
    const rerender = useRerender();
    useEventEmitter<IGanttViewStateEvents>(viewState.events, 'onZoomLevelChanged', rerender);

    return (
        <ZoomSlider
            ariaLabel={labels.getLocalizedString('zoomSlider')}
            value={value}
            disabled={provider.isLoading()}
            onChange={(nextValue: number) => viewState.setZoomLevel(nextValue)}
        />
    );
}
