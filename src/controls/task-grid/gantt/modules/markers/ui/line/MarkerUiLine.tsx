import { useMemo } from "react";
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
    const styles = useMemo(() => getMarkerUiLineStyles(), []);

    const background = props.lineStyle === 'solid' ? props.color : `repeating-linear-gradient(to bottom, ${props.color} 0 6px, transparent 6px 11px)`;
    return components.onRenderContainer({ className: styles.line, style: { background } });
};
