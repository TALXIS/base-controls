import { useTheme } from "@theme";
import { useMemo } from "react";

import { MarkerUiChipComponents, IMarkerUiChipComponents } from "./components";
import { getMarkerUiChipStyles } from "./styles";

export interface IMarkerUiChipProps {
    text: string;
    /** What the chip says when pointed at, such as the date. */
    title: string;
    color: string;
    /** Cuts the text off with an ellipsis past this width. */
    maxWidth?: number;
    components?: Partial<IMarkerUiChipComponents>;
}

/** A marker's label on the scale. */
export const MarkerUiChip = (props: IMarkerUiChipProps) => {
    const components = { ...MarkerUiChipComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getMarkerUiChipStyles(theme, props.color), [theme, props.color]);

    return components.onRender({
        hostClassName: styles.host,
        content: props.title,
        children: components.onRenderChip({ className: styles.chip, style: { maxWidth: props.maxWidth }, children: props.text }),
    });
};
