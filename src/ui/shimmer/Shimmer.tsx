import { IShimmerProps as IFluentShimmerProps, Shimmer as FluentShimmer } from "@fluentui/react";

export interface IShimmerProps extends IFluentShimmerProps { }

/** Fluent's `Shimmer`. */
export const Shimmer = (props: IShimmerProps) => <FluentShimmer {...props} />;
