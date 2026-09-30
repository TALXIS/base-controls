import { useMemo } from "react";
import { Target } from "@fluentui/react";
import { FilteringUiCalloutComponents, IFilteringUiCalloutComponents } from "./components";
import { getFilteringUiCalloutStyles } from "./styles";

export interface IFilteringUiCalloutProps {
    /** What the callout points at. */
    target?: Target;
    title: string;
    onDismiss: () => void;
    /** What the filter is set with, drawn under the header. */
    children?: React.ReactNode;
    components?: Partial<IFilteringUiCalloutComponents>;
}

/** The callout a column's filter is set in. */
export const FilteringUiCallout = (props: IFilteringUiCalloutProps) => {
    const components = { ...FilteringUiCalloutComponents, ...props.components };
    const styles = useMemo(() => getFilteringUiCalloutStyles(), []);

    return components.onRenderCallout({
        target: props.target,
        onDismiss: props.onDismiss,
        calloutWidth: 230,
        className: styles.root,
        children: <>
            {components.onRenderHeader({
                className: styles.header,
                children: <>
                    {components.onRenderTitle({ className: styles.title, variant: 'mediumPlus', children: props.title })}
                    {components.onRenderCloseButton({ iconProps: { iconName: 'ChromeClose' }, onClick: () => props.onDismiss() })}
                </>,
            })}
            {props.children}
        </>,
    });
};
