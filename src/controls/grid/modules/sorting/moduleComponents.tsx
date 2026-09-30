import { Icon, IIconProps } from "@fluentui/react";

/** The sort icon's props, with which way the column is sorted. */
export interface IGridSortingIconProps extends IIconProps {
    descending: boolean;
}

/** The replaceable pieces of the icon a sorted column shows in its header. */
export interface IGridSortingIconComponents {
    onRenderIcon: (props: IGridSortingIconProps) => JSX.Element | null;
}

/** The defaults for {@link IGridSortingIconComponents}. */
export const GridSortingIconComponents: IGridSortingIconComponents = {
    onRenderIcon: ({ descending, ...props }) => <Icon {...props} />,
};

/** The replaceable parts of what sorting draws, by the piece they belong to. */
export interface IGridSortingComponents {
    /** What a sorted column shows in its header. */
    sortIcon?: Partial<IGridSortingIconComponents>;
}
