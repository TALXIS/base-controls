import type { IStyle } from "@fluentui/react";
import { MARKERS_MOUNT_POINT_CLASS } from "./classNames";

export const getMarkersStyles = (): IStyle => ({
    //lays nothing out so the layer inside is placed against the chart
    [`.${MARKERS_MOUNT_POINT_CLASS}`]: {
        display: 'contents',
    },
});
