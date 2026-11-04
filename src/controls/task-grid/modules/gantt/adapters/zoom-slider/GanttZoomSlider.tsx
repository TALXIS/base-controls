import { useEffect, useState } from "react";
import { useEventEmitter, useRerender } from "@core";
import { useLabels } from "@labels";
import { useDataProviderEvents } from "@data";
import { GanttUiZoomSlider, IGanttUiZoomSliderComponents } from "../../ui/zoom-slider";
import { useRequiredDatasetControlRuntime } from "@controls/dataset-control/adapters/root/context";
import type { IGantt, IGanttEvents } from "../../interfaces";
import type { IGanttZoomingEvents } from "../../zooming";
import { GANTT_LABELS } from "../../labels";

//fine enough that dragging the slider zooms continuously
const SLIDER_RESOLUTION = 1000;
const BUTTON_STEPS = 12;

export interface IGanttZoomSliderProps {
    components?: Partial<IGanttUiZoomSliderComponents>;
}

/** The zoom of the `TaskGantt` in the body, for the header. */
export const GanttZoomSlider = (props: IGanttZoomSliderProps) => {
    const datasetControl = useRequiredDatasetControlRuntime();
    const provider = useDataProviderEvents(['onLoading']);
    const [gantt, setGantt] = useState<IGantt | undefined>(() => datasetControl.parts.find('gantt'));
    const zooming = gantt?.services.find('zooming');
    const { rerender } = useRerender();
    const labels = useLabels(GANTT_LABELS);

    //the header renders before the body that holds the Gantt
    useEffect(() => datasetControl.parts.observe('gantt', gantt => {
        setGantt(gantt);
        return () => setGantt(undefined);
    }), []);
    useEventEmitter<IGanttEvents>(gantt?.events, 'onChartReady', rerender);
    useEventEmitter<IGanttZoomingEvents>(zooming?.events, 'onZoomChanged', rerender);

    return <GanttUiZoomSlider
        ariaLabel={labels.get('gantt.zoomSlider')}
        min={0}
        max={SLIDER_RESOLUTION}
        buttonStep={SLIDER_RESOLUTION / BUTTON_STEPS}
        value={Math.round((zooming?.getPosition() ?? 0) * SLIDER_RESOLUTION)}
        disabled={!zooming || provider.isLoading()}
        onChange={value => zooming?.setPosition(value / SLIDER_RESOLUTION)}
        components={props.components} />;
};
