import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { useGanttService } from "../../../context";
import type { IGanttOverlayEvents } from "../../../overlay";
import { GanttUiOverlay, IGanttUiOverlayComponents } from "../../ui/overlay";

export interface IGanttOverlayLayerProps {
    components?: Partial<IGanttUiOverlayComponents>;
}

/** Draws the cover over the Gantt while the `overlay` service has it shown. */
export const GanttOverlayLayer = (props: IGanttOverlayLayerProps) => {
    const overlay = useGanttService('overlay');
    const { rerender } = useRerender();

    useEventEmitter<IGanttOverlayEvents>(overlay.events, 'onVisibilityChanged', rerender);

    return overlay.isVisible() ? <GanttUiOverlay components={props.components} /> : null;
};
