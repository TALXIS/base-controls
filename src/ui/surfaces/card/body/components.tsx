/** The replaceable pieces of the card body. */
export interface ICardBodyComponents {
    /** The body. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICardBodyComponents}. */
export const CardBodyComponents: ICardBodyComponents = {
    onRender: props => <div {...props} />,
};
