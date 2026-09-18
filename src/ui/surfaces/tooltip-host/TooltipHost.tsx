import * as React from 'react';
import { ITooltipHostProps, TooltipHost as TooltipHostBase } from "@fluentui/react";
import { useSurfaceTheme } from "@theme";

/** A tooltip drawn in the application's theme rather than in the one its host is drawn in. */
export const TooltipHost = (props: ITooltipHostProps) => {
    const { tooltipProps, calloutProps, ...hostProps } = props;
    const theme = useSurfaceTheme();

    return <TooltipHostBase
        {...hostProps}
        tooltipProps={{ theme: theme, ...tooltipProps }}
        calloutProps={{ theme: theme, ...calloutProps }} />;
};
