import { ReactNode, useMemo } from "react";
import { MarkerUiColumnComponents, IMarkerUiColumnComponents } from "./components";
import { getMarkerUiColumnStyles } from "./styles";

export interface IMarkerUiColumnProps {
    /** Where the marker's date is on the timeline, in pixels. */
    left: number;
    /** The track and the scale. */
    children?: ReactNode;
    components?: Partial<IMarkerUiColumnComponents>;
}

/** A zero-width column at a date, down the whole timeline. */
export const MarkerUiColumn = (props: IMarkerUiColumnProps) => {
    const components = { ...MarkerUiColumnComponents, ...props.components };
    const styles = useMemo(() => getMarkerUiColumnStyles(), []);

    return components.onRenderContainer({ className: styles.column, style: { left: props.left }, children: props.children });
};
