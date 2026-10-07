import * as React from 'react';
import { useMemo } from 'react';
import { concatStyleSetsWithProps, IPanelProps, IPanelStyleProps, IPanelStyles, Panel as PanelBase } from "@fluentui/react";
import { ThemeProvider, useSurfaceTheme } from "@theme";
import { getPanelStyles } from './styles';

/** A panel drawn in the application's theme rather than in the one it was opened from. */
export const Panel = (props: IPanelProps & { children?: React.ReactNode }) => {
    const { children, styles: userStyles, ...panelProps } = props;
    const theme = useSurfaceTheme();
    const styles = useMemo(() => getPanelStyles(theme), [theme]);
    const panelStyles = { commands: styles.commands, footer: styles.footer, footerInner: styles.footerInner, scrollableContent: styles.scrollableContent, content: styles.content, header: styles.header, headerText: styles.headerText, subComponentStyles: { closeButton: { root: styles.closeButton } } };

    return <PanelBase
        theme={theme}
        styles={(styleProps: IPanelStyleProps) => concatStyleSetsWithProps<IPanelStyleProps, IPanelStyles>(styleProps, panelStyles, userStyles)}
        {...panelProps}
    >
        <ThemeProvider theme={theme} className={styles.body}>
                {children}
        </ThemeProvider>
    </PanelBase>;
};
