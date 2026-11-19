/** The replaceable pieces of a cell. */
export interface IFormV2UiCellComponents {
    /** The cell's box, holding its label and control. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement> & { 'data-id'?: string }) => JSX.Element | null;
    /** The label with its required mark and lock. */
    onRenderLabel: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** The control with its error below. */
    onRenderControl: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IFormV2UiCellComponents}. */
export const FormV2UiCellComponents: IFormV2UiCellComponents = {
    onRender: props => <div {...props} />,
    onRenderLabel: props => <div {...props} />,
    onRenderControl: props => <div {...props} />,
};
