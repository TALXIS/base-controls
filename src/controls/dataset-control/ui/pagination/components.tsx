import { CommandBar, ICommandBarProps } from "@legacy";

/** The replaceable pieces of the pagination. */
export interface IPaginationUiComponents {
    /** The paging buttons, as the command bar's `items`. */
    onRenderCommandBar: (props: ICommandBarProps) => JSX.Element | null;
}

/** The defaults for {@link IPaginationUiComponents}. */
export const PaginationUiComponents: IPaginationUiComponents = {
    onRenderCommandBar: props => <CommandBar {...props} />,
};
