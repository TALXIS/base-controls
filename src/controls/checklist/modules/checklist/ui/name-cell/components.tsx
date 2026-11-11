/** The replaceable pieces of an item's name. */
export interface IChecklistUiNameCellComponents {
    /** The box the name is drawn in; its `className` carries the strike-through. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IChecklistUiNameCellComponents}. */
export const ChecklistUiNameCellComponents: IChecklistUiNameCellComponents = {
    onRender: props => <div {...props} />,
};
