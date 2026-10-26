import { ICalloutProps } from "@fluentui/react";
import { Callout } from "@ui";
import type { IGanttNonWorkingDay } from "../../../GanttNonWorkingDays";

export interface INonWorkingDayTooltipDescriptionProps extends React.HTMLAttributes<HTMLSpanElement> {
    /** The day the description belongs to. */
    day: IGanttNonWorkingDay<unknown>;
}

/** The replaceable pieces of a non-working day's tooltip. */
export interface INonWorkingDayTooltipComponents {
    onRenderCallout: (props: ICalloutProps) => JSX.Element | null;
    /** Holds the descriptions, inside the callout. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderDescription: (props: INonWorkingDayTooltipDescriptionProps) => JSX.Element | null;
}

/** The defaults for {@link INonWorkingDayTooltipComponents}. */
export const NonWorkingDayTooltipComponents: INonWorkingDayTooltipComponents = {
    onRenderCallout: props => <Callout {...props} />,
    onRenderContainer: props => <div {...props} />,
    onRenderDescription: ({ day, ...props }) => <span {...props} />,
};
