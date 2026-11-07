import { useMemo } from "react";
import { css, ISpinnerProps, SpinnerSize } from "@fluentui/react";
import { useTheme } from "@theme";
import { getSpinnerStyles } from "./styles";

/** A spinner drawn and animated as Fluent UI 9 draws it; it takes Fluent 8's spinner props. */
export const Spinner = (props: ISpinnerProps) => {
    const theme = useTheme();
    const size = props.size ?? SpinnerSize.medium;
    const labelPosition = props.labelPosition ?? 'bottom';
    const styles = useMemo(() => getSpinnerStyles(theme, size, labelPosition), [theme, size, labelPosition]);

    return <div className={css(styles.root, props.className)} role='progressbar' aria-label={props.ariaLabel ?? props.label} aria-live={props.ariaLive ?? 'polite'}>
        <span className={styles.track}>
            <span className={styles.tail} />
        </span>
        {props.label && <span className={styles.label}>{props.label}</span>}
    </div>;
};
