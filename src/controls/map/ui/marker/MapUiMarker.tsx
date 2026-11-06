import { useMemo } from "react";
import { getClassNames } from "@core";
import { useTheme } from "@theme";
import { IMapUiMarkerComponents, MapUiMarkerComponents } from "./components";
import { getMapUiMarkerStyles } from "./styles";

export interface IMapUiMarkerProps {
    /** The pin's fill; the theme's primary colour when left out. */
    color?: string;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IMapUiMarkerComponents>;
}

/** One pin, a teardrop whose tip is at the bottom centre of its box. */
export const MapUiMarker = (props: IMapUiMarkerProps) => {
    const components = { ...MapUiMarkerComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getMapUiMarkerStyles(theme, props.color), [theme, props.color]);

    return components.onRenderContainer({
        className: getClassNames([styles.container, props.className]),
        children: components.onRenderPin({
            className: styles.pin,
            children: components.onRenderDot({ className: styles.dot }),
        }),
    });
};
