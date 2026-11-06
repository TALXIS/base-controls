import { Fragment, useMemo } from "react";
import { IColumn } from "@talxis/client-libraries";
import type { IQuickFindUiLabels } from "../components";
import { IQuickFindCalloutComponents, QuickFindCalloutComponents } from "./components";
import { getQuickFindCalloutStyles } from "./styles";

/** Props for the callout that explains how the search matches. */
export interface IQuickFindCalloutProps {
    /** The selector of the element the callout points at. */
    target: string;
    /** The columns a search matches on. */
    columns: IColumn[];
    /** Whether to show the wildcard warning instead of the columns. */
    isLikeQuery: boolean;
    /** The callout's strings. */
    labels: IQuickFindUiLabels;
    /** Called when the callout closes. */
    onDismiss: () => void;
    /** Replacements for its slots. */
    components?: Partial<IQuickFindCalloutComponents>;
}

/** Explains how the search matches: a warning for a leading wildcard, otherwise the columns it searches. */
export const QuickFindCallout = (props: IQuickFindCalloutProps) => {
    const components = { ...QuickFindCalloutComponents, ...props.components };
    const styles = useMemo(() => getQuickFindCalloutStyles(), []);

    return components.onRenderCallout({
        target: props.target,
        calloutMaxWidth: 250,
        styles: { calloutMain: styles.calloutMain },
        onDismiss: props.onDismiss,
        children: props.isLikeQuery
            ? components.onRenderLikeWarning({ text: props.labels.leadingWildcardWarning })
            : <>
                {components.onRenderDescription(props.labels)}
                {components.onRenderColumns({
                    className: styles.columns,
                    children: props.columns.map(column => <Fragment key={column.name}>{components.onRenderColumn({ column })}</Fragment>),
                })}
            </>,
    });
};
