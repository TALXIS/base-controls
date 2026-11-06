import { useMemo } from "react";
import { getClassNames } from "@core";
import { IRibbonShimmerUiComponents, RibbonShimmerUiComponents } from "./components";
import { getRibbonShimmerUiStyles } from "./styles";

//as wide as the skeleton's ribbon pill
const SHIMMER_WIDTH = 208;

export interface IRibbonShimmerUiProps {
    /** Which side the shimmer is drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
    className?: string;
    components?: Partial<IRibbonShimmerUiComponents>;
}

/** A shimmer the height of the command bar, standing in for the commands. */
export const RibbonShimmerUi = (props: IRibbonShimmerUiProps) => {
    const components = { ...RibbonShimmerUiComponents, ...props.components };
    const styles = useMemo(() => getRibbonShimmerUiStyles(props.align ?? 'start'), [props.align]);
    return components.onRenderShimmer({
        width: SHIMMER_WIDTH,
        className: getClassNames([styles.ribbonShimmer, props.className]),
        styles: { shimmerWrapper: styles.shimmerWrapper },
    });
};
