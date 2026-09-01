import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { getMilestoneMarkerStyles } from "./styles";
import { IMarkerProps, Marker } from "../Marker";

/** How far the diamond has to shift left to sit centred on its date. */
const DIAMOND_OFFSET_PX = 12;

/** A milestone marker: the diamond, rather than the chip the other markers draw. */
export const MilestoneMarker = (props: Omit<IMarkerProps, 'type'>) => {
    const theme = useTheme();
    const styles = useMemo(() => getMilestoneMarkerStyles(theme), [theme]);

    return <Marker {...props} type='milestone' components={{
        onRenderContainer: (containerProps) => <div {...containerProps} style={{
            ...containerProps.style,
            left: `calc(${containerProps.style?.left} - ${DIAMOND_OFFSET_PX}px)`,
            bottom: 5
        }} />,
        onRenderContent: () => <div className={styles.root} />
    }} />
}
