import { ITooltipHostProps } from "@fluentui/react";
import { TooltipHost } from "@ui";

/** The replaceable pieces of a marker's chip on the scale. */
export interface IGanttMarkerUiChipComponents {
    /** Holds the chip, and says the date when pointed at. */
    onRenderTooltip: (props: ITooltipHostProps) => JSX.Element | null;
    onRenderChip: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IGanttMarkerUiChipComponents}. */
export const GanttMarkerUiChipComponents: IGanttMarkerUiChipComponents = {
    onRenderTooltip: props => <TooltipHost {...props} />,
    onRenderChip: props => <div {...props} />,
};
