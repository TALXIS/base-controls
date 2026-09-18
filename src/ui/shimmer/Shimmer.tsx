import { useMemo } from "react";
import { IShimmerProps as IFluentShimmerProps, Shimmer as FluentShimmer, useTheme } from "@fluentui/react";

export interface IShimmerProps extends IFluentShimmerProps { }

/**
 * Fluent's `Shimmer`, drawn in the theme it is rendered in.
 *
 * Fluent's own colours come from `palette.neutralLight`/`neutralLighter`/`white`, which on a coloured or
 * dark surface leave a grey bar that has nothing to do with the background behind it. These derive from
 * the surface itself: the gaps take the body's background, and the bar is the body's text at low opacity.
 * Anything passed in `shimmerColors` still wins.
 */
export const Shimmer = (props: IShimmerProps) => {
    const theme = useTheme();

    const shimmerColors = useMemo(() => ({
        background: theme.semanticColors.bodyBackground,
        shimmer: `color-mix(in srgb, ${theme.semanticColors.bodyText}, transparent 88%)`,
        shimmerWave: `color-mix(in srgb, ${theme.semanticColors.bodyText}, transparent 76%)`,
        ...props.shimmerColors,
    }), [theme, props.shimmerColors]);
    

    return <FluentShimmer {...props} shimmerColors={shimmerColors} />;
};
