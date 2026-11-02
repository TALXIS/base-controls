import { DefaultButton, IButtonProps, PrimaryButton } from "@fluentui/react";
import type { IFilteringUiCalloutComponents } from "@controls/grid";
import type { ILookupManySelectComponents } from "../../lookup-many-select";

/** The replaceable pieces of {@link LookupManyFilter}. */
export interface ILookupManyFilterComponents {
    /** Holds the operator, the value and the buttons. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** Holds what the operator compares with. */
    onRenderValue: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderButtons: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderApplyButton: (props: IButtonProps) => JSX.Element | null;
    onRenderClearButton: (props: IButtonProps) => JSX.Element | null;
    /** The callout the filter is drawn in. */
    callout?: Partial<IFilteringUiCalloutComponents>;
    /** The picker of the records compared with. */
    select?: Partial<ILookupManySelectComponents>;
}

/** The defaults for {@link ILookupManyFilterComponents}. */
export const LookupManyFilterComponents: ILookupManyFilterComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderValue: props => <div {...props} />,
    onRenderButtons: props => <div {...props} />,
    onRenderApplyButton: props => <PrimaryButton {...props} />,
    onRenderClearButton: props => <DefaultButton {...props} />,
};
