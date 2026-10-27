import { IOptionTagComponents } from "@ui";

/** The replaceable pieces of the tooltip's header. */
export interface ITaskTooltipUiHeaderComponents {
    /** Holds the title and the status. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderTitle: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
    /** The pieces of the status's option tag. */
    status?: Partial<IOptionTagComponents>;
}

/** The defaults for {@link ITaskTooltipUiHeaderComponents}. */
export const TaskTooltipUiHeaderComponents: ITaskTooltipUiHeaderComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderTitle: props => <span {...props} />,
};
