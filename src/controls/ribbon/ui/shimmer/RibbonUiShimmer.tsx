import { useMemo } from "react";
import { getClassNames } from "@core";
import { IRibbonUiShimmerComponents, RibbonUiShimmerComponents } from "./components";
import { getRibbonUiShimmerStyles } from "./styles";
import { DatasetControl } from "@controls/dataset-control";
import { Ribbon } from "@legacy/ribbon";

//as wide as the skeleton's ribbon pill
const SHIMMER_WIDTH = 208;

export interface IRibbonUiShimmerProps {
    /** Which side the shimmer is drawn against; defaults to `'start'`. */
    align?: 'start' | 'end';
    className?: string;
    components?: Partial<IRibbonUiShimmerComponents>;
}

/** A shimmer the height of the command bar, standing in for the commands. */
export const RibbonUiShimmer = (props: IRibbonUiShimmerProps) => {
    const components = { ...RibbonUiShimmerComponents, ...props.components };
    const styles = useMemo(() => getRibbonUiShimmerStyles(props.align ?? 'start'), [props.align]);
    return components.onRenderShimmer({
        width: SHIMMER_WIDTH,
        className: getClassNames([styles.ribbonShimmer, props.className]),
        styles: { shimmerWrapper: styles.shimmerWrapper },
    });
};
