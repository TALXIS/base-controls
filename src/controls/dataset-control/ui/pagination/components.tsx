import { CommandBar, ICommandBarProps } from "@legacy";

/** The replaceable pieces of the pagination. */
export interface IDatasetControlUiPaginationComponents {
    /** The paging buttons, as the command bar's `items`. */
    onRender: (props: ICommandBarProps) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiPaginationComponents}. */
export const DatasetControlUiPaginationComponents: IDatasetControlUiPaginationComponents = {
    onRender: props => <CommandBar {...props} />,
};
