import * as React from 'react';
import { IPanelProps, Panel as PanelBase } from "@fluentui/react";
import { ThemeContext, useSurfaceTheme } from "@theme";

/** A panel drawn in the application's theme rather than in the one it was opened from. */
export const Panel = (props: IPanelProps & { children?: React.ReactNode }) => {
    const { children, ...panelProps } = props;
    const theme = useSurfaceTheme();

    return <PanelBase theme={theme} {...panelProps}>
        <ThemeContext theme={theme}>{children}</ThemeContext>
    </PanelBase>;
};
