import { useEffect, useState } from "react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { useDataProviderEvents, useLabels } from "@utils";
import { ZoomSlider } from "../../ui/zoom-slider";
import { useRequiredDatasetControlRuntime } from "@controls/dataset-control/components/adapters/root/context";
import type { IGantt, IGanttEvents } from "../../../interfaces";
import type { IGanttZoomingEvents } from "../../../zooming/GanttZooming";
import { GANTT_LABELS } from "../../../labels";

//fine enough that dragging the slider zooms continuously
const SLIDER_RESOLUTION = 1000;
const BUTTON_STEPS = 12;

/** The zoom of the `TaskGantt` in the body; goes in the header. */
export const GanttZoomSlider = () => {
    const datasetControl = useRequiredDatasetControlRuntime();
    const provider = useDataProviderEvents(['onLoading']);
    const [gantt, setGantt] = useState<IGantt | undefined>(() => datasetControl.parts.find('gantt'));
    const zooming = gantt?.services.find('zooming');
    const { rerender } = useRerender();
    const labels = useLabels(GANTT_LABELS);

    //the header renders before the body that holds the Gantt
    useEffect(() => datasetControl.parts.whenAvailable('gantt', setGantt), []);
    useEventEmitter<IGanttEvents>(gantt?.events, 'onChartReady', rerender);
    useEventEmitter<IGanttZoomingEvents>(zooming?.events, 'onZoomChanged', rerender);

    return <ZoomSlider
        ariaLabel={labels.get('gantt.zoomSlider')}
        min={0}
        max={SLIDER_RESOLUTION}
        buttonStep={SLIDER_RESOLUTION / BUTTON_STEPS}
        value={Math.round((zooming?.getPosition() ?? 0) * SLIDER_RESOLUTION)}
        disabled={!zooming || provider.isLoading()}
        onChange={value => zooming?.setPosition(value / SLIDER_RESOLUTION)} />;
};
