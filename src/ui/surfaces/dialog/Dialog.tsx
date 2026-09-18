import * as React from 'react';
import { Dialog as DialogBase, IDialogProps } from "@fluentui/react";
import { ThemeContext, useSurfaceTheme } from "@theme";

/** A dialog drawn in the application's theme rather than in the one it was opened from. */
export const Dialog = (props: IDialogProps & { children?: React.ReactNode }) => {
    const { children, modalProps, ...dialogProps } = props;
    const theme = useSurfaceTheme();

    return <DialogBase theme={theme} {...dialogProps} modalProps={{ theme: theme, ...modalProps }}>
        <ThemeContext theme={theme}>{children}</ThemeContext>
    </DialogBase>;
};
