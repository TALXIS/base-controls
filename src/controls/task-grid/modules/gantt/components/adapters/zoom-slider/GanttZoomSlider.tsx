import { useEffect, useState } from "react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { useDataProviderEvents } from "@utils";
import { ZoomSlider } from "@ui/zoom-slider";
import { useRequiredDatasetControlRuntime } from "@controls/dataset-control/components/adapters/root/context";
import type { IGantt, IGanttEvents } from "../../interfaces";
import type { IGanttZoomingEvents } from "../../zooming/GanttZooming";

/** The zoom of the `TaskGantt` in the body; goes in the header. */
export const GanttZoomSlider = () => {
    const datasetControl = useRequiredDatasetControlRuntime();
    const provider = useDataProviderEvents(['onLoading']);
    const [gantt, setGantt] = useState<IGantt | undefined>(() => datasetControl.parts.find('gantt'));
    const zooming = gantt?.services.find('zooming');
    const { rerender } = useRerender();

    //the header renders before the body that holds the Gantt
    useEffect(() => datasetControl.parts.whenAvailable('gantt', setGantt), []);
    useEventEmitter<IGanttEvents>(gantt?.events, 'onChartReady', rerender);
    useEventEmitter<IGanttZoomingEvents>(zooming?.events, 'onZoomChanged', rerender);

    return <ZoomSlider
        ariaLabel={gantt?.getLabels().getLocalizedString('zoomSlider')}
        min={0}
        max={Math.max(0, (zooming?.getStopCount() ?? 1) - 1)}
        value={zooming?.getStopIndex() ?? 0}
        disabled={!zooming || provider.isLoading()}
        onChange={stopIndex => zooming?.setStopIndex(stopIndex)} />;
};
