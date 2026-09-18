import { ISpinnerProps, Spinner as FluentSpinner } from "@fluentui/react";
import { ThemeProvider } from "@theme";
import { useV9StyledV8Theme } from "@theme/hooks";

export const Spinner = (props: ISpinnerProps) => {
    const v9Theme = useV9StyledV8Theme();

    return (<ThemeProvider applyTo="none" theme={v9Theme}>
        <FluentSpinner {...props} />
    </ThemeProvider>)
}