import { FontIcon, ICalloutProps, Text } from "@fluentui/react";
import { IColumn } from "@talxis/client-libraries";
import { Callout } from "@ui";
import type { IQuickFindUiLabels } from "../components";
import { getQuickFindCalloutStyles } from "./styles";

/** Props for one column in the callout. */
export interface IQuickFindCalloutColumnProps {
    /** The column a search matches on. */
    column: IColumn;
}

/** The replaceable pieces of the quick find callout. */
export interface IQuickFindCalloutComponents {
    /** The callout itself. */
    onRenderCallout: (props: ICalloutProps) => JSX.Element | null;
    /** Shown instead of the description and columns while the query starts with a wildcard. */
    onRenderLikeWarning: (props: { text: string }) => JSX.Element | null;
    /** The sentence above the columns. */
    onRenderDescription: (props: IQuickFindUiLabels) => JSX.Element | null;
    /** Holds the columns; its `children` are what `onRenderColumn` returns. */
    onRenderColumns: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** One column a search matches on. */
    onRenderColumn: (props: IQuickFindCalloutColumnProps) => JSX.Element | null;
}

const styles = getQuickFindCalloutStyles();

/** The defaults for {@link IQuickFindCalloutComponents}. */
export const QuickFindCalloutComponents: IQuickFindCalloutComponents = {
    onRenderCallout: props => <Callout {...props} />,
    onRenderLikeWarning: props => <Text><FontIcon className={styles.warningIcon} iconName="Warning" />{props.text}</Text>,
    onRenderDescription: props => <Text>{props.columnsHintStart} <span className={styles.bold}>{props.columnsHintOperator}</span> {props.columnsHintEnd}</Text>,
    onRenderColumns: props => <div {...props} />,
    onRenderColumn: props => <Text><span className={styles.bold}>{props.column.displayName}</span></Text>,
};
