import * as React from 'react';
import { ComboBox as ComboBoxBase, IComboBoxProps } from "@fluentui/react";
import { ThemeContext, useSurfaceTheme } from "@theme";
import { getSurfaceOptionStyles } from "./styles";

/**
 * A combo box whose list is drawn in the application's theme rather than in the input's.
 *
 * Three things are needed for that: the callout takes the theme, the list is drawn in it, and the option
 * styles the combo box works out from its own theme before the callout exists are overridden.
 */
export const ComboBox = React.forwardRef<HTMLDivElement, IComboBoxProps>((props, ref) => {
    const { calloutProps, comboBoxOptionStyles, onRenderContainer, ...comboBoxProps } = props;
    const theme = useSurfaceTheme();
    const optionStyles = React.useMemo(() => getSurfaceOptionStyles(theme), [theme]);

    //the list is drawn on the surface, so what a consumer renders in it takes the surface's theme too
    const onRenderSurfaceContainer: IComboBoxProps['onRenderContainer'] = (containerProps, defaultRender) => {
        const render = onRenderContainer ?? defaultRender;
        return <ThemeContext theme={theme}>{render?.(containerProps, defaultRender)}</ThemeContext>;
    };

    return <ComboBoxBase
        ref={ref}
        {...comboBoxProps}
        comboBoxOptionStyles={{ ...optionStyles, ...comboBoxOptionStyles }}
        onRenderContainer={onRenderSurfaceContainer}
        calloutProps={{ theme: theme, ...calloutProps }} />;
});
ComboBox.displayName = 'ComboBox';
