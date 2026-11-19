/** The replaceable pieces of the card. */
export interface ICardComponents {
    /** The card's box. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICardComponents}. */
export const CardComponents: ICardComponents = {
    onRender: props => <div {...props} />,
};
