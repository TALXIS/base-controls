import * as React from 'react';
import { Callout as CalloutBase, ICalloutProps } from "@fluentui/react";
import { ThemeContext, useSurfaceTheme } from "@theme";

/** A callout drawn in the application's theme rather than in the one it was opened from. */
export const Callout = (props: ICalloutProps & { children?: React.ReactNode }) => {
    const { children, ...calloutProps } = props;
    const theme = useSurfaceTheme();

    return <CalloutBase theme={theme} {...calloutProps}>
        <ThemeContext theme={theme}>{children}</ThemeContext>
    </CalloutBase>;
};
