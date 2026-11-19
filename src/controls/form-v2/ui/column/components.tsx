/** The replaceable pieces of a column. */
export interface IFormV2UiColumnComponents {
    /** The column's box, stacking its sections. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IFormV2UiColumnComponents}. */
export const FormV2UiColumnComponents: IFormV2UiColumnComponents = {
    onRender: props => <div {...props} />,
};
