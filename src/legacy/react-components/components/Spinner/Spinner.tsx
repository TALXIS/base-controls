import { ISpinnerProps, ThemeProvider, Spinner as FluentSpinner } from "@fluentui/react";
import { useV9StyledV8Theme } from "@legacy/utilities/theming/hooks";

export const Spinner = (props: ISpinnerProps) => {
    const v9Theme = useV9StyledV8Theme();

    return (<ThemeProvider applyTo="none" theme={v9Theme}>
        <FluentSpinner {...props} />
    </ThemeProvider>)
}