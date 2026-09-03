import { useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";
import { useTaskDataProvider } from "@components/TaskGrid/context";
import { ZoomSlider } from "@components/zoom-slider";
import { IGanttZoomingEvents } from '../gantt-zooming';
import { useGanttLabels, useGanttService } from "../context";

/** The timeline's zoom, as the slider the header renders left of the ribbon. */
export const ZoomSliderAdapter = () => {
    const provider = useTaskDataProvider();
    const zooming = useGanttService('ganttZooming');
    const labels = useGanttLabels();
    const rerender = useRerender();
    useEventEmitter<IGanttZoomingEvents>(zooming?.events, 'onZoomChanged', rerender);

    return (
        <ZoomSlider
            ariaLabel={labels.getLocalizedString('zoomSlider')}
            min={0}
            max={Math.max(0, (zooming?.getStopCount() ?? 1) - 1)}
            step={1}
            value={zooming?.getStopIndex() ?? 0}
            disabled={!zooming || provider.isLoading()}
            onChange={(stopIndex: number) => zooming?.setStopIndex(stopIndex)}
        />
    );
}
