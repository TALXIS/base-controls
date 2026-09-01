import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { getMilestoneMarkerStyles } from "./styles";
import { IMarkerProps, Marker } from "../marker";

/** How far the diamond has to shift out of its slot to sit centred on its date. */
const DIAMOND_OFFSET_PX = 12;

/** A milestone marker: the diamond, rather than the chip {@link Marker} draws. */
export const MilestoneMarker = (props: IMarkerProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getMilestoneMarkerStyles(theme), [theme]);

    return <Marker {...props} components={{
        onRenderContainer: (containerProps) => <div {...containerProps} style={{
            ...containerProps.style,
            position: 'relative',
            left: -DIAMOND_OFFSET_PX,
            bottom: 5,
        }} />,
        onRenderContent: () => <div className={styles.root} />
    }} />
}
