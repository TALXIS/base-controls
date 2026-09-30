import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { AggregationUiTotalValueComponents, IAggregationUiTotalValueComponents } from "./components";
import { getAggregationUiTotalValueStyles } from "./styles";

export interface IAggregationUiTotalValueProps {
    /** What the total is of. */
    label?: string;
    /** The total, formatted. */
    value?: string;
    components?: Partial<IAggregationUiTotalValueComponents>;
}

/** What a total reads as: what it is a total of, and the total itself. */
export const AggregationUiTotalValue = (props: IAggregationUiTotalValueProps) => {
    const components = { ...AggregationUiTotalValueComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getAggregationUiTotalValueStyles(theme), [theme]);

    return components.onRenderContainer({
        className: styles.total,
        children: <>
            {props.label && components.onRenderLabel({ className: styles.label, children: props.label })}
            {components.onRenderValue({ className: styles.value, children: props.value })}
        </>,
    });
};
