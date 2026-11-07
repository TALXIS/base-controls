import { ReactNode, useMemo } from "react";
import { getClassNames } from "@core";
import { useTheme } from "@theme";
import { getMapUiMarkerPinStyles } from "./styles";

export interface IMapUiMarkerPinProps {
    /** The fill; the theme's primary colour when left out. */
    color?: string;
    className?: string;
    /** Drawn in its centre, such as the white dot. */
    children?: ReactNode;
}

/** The teardrop of a pin, its tip at the bottom centre of the marker's box. */
export const MapUiMarkerPin = (props: IMapUiMarkerPinProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getMapUiMarkerPinStyles(theme, props.color), [theme, props.color]);
    return <div className={getClassNames([styles.pin, props.className])}>{props.children}</div>;
};
