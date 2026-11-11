import { useMemo } from "react";
import { getTintColors, useTheme } from "@theme";
import { MarkerUiLineComponents, IMarkerUiLineComponents } from "./components";
import { getMarkerUiLineStyles } from "./styles";

export type MarkerLineStyle = 'solid' | 'dotted';

export interface IMarkerUiLineProps {
    color: string;
    /** Dotted by default. */
    lineStyle?: MarkerLineStyle;
    components?: Partial<IMarkerUiLineComponents>;
}

/** A vertical line down the timeline. */
export const MarkerUiLine = (props: IMarkerUiLineProps) => {
    const components = { ...MarkerUiLineComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getMarkerUiLineStyles(), []);
    //the colour its chip is filled with
    const color = getTintColors(props.color, theme, 'solid').background;
    const background = props.lineStyle === 'solid' ? color : `repeating-linear-gradient(to bottom, ${color} 0 6px, transparent 6px 11px)`;
    return components.onRender({ className: styles.line, style: { background } });
};
