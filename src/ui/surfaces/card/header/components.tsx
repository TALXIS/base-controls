/** The replaceable pieces of the card header. */
export interface ICardHeaderComponents {
    /** The row. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICardHeaderComponents}. */
export const CardHeaderComponents: ICardHeaderComponents = {
    onRender: props => <div {...props} />,
};
