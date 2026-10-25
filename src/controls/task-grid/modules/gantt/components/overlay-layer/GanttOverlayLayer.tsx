import { useEffect, useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { useCreateGanttService, useGantt } from "../../context";
import { GanttOverlay, IGanttOverlayEvents } from "../../overlay";
import { getGanttOverlayLayerStyles } from "./styles";

/** Creates the `overlay` service and draws its cover over the Gantt. */
export const GanttOverlayLayer = () => {
    const gantt = useGantt();
    const overlay = useCreateGanttService('overlay', () => new GanttOverlay(gantt.getTaskRuntime().getProvider()));
    const theme = useTheme();
    const styles = useMemo(() => getGanttOverlayLayerStyles(theme), [theme]);
    const { rerender } = useRerender();

    useEffect(() => () => overlay.destroy(), []);
    useEventEmitter<IGanttOverlayEvents>(overlay.events, 'onVisibilityChanged', rerender);

    return overlay.isVisible() ? <div className={styles.root} /> : null;
};
