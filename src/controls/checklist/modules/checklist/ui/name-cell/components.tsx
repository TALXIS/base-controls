/** The replaceable pieces of an item's name. */
export interface INameCellUiComponents {
    /** The box the name is drawn in; its `className` carries the strike-through. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link INameCellUiComponents}. */
export const NameCellUiComponents: INameCellUiComponents = {
    onRenderContainer: props => <div {...props} />,
};
