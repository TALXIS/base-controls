/** The replaceable pieces of the card footer. */
export interface ICardFooterComponents {
    /** The row. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICardFooterComponents}. */
export const CardFooterComponents: ICardFooterComponents = {
    onRender: props => <div {...props} />,
};
