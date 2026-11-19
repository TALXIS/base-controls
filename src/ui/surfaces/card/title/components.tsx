/** The replaceable pieces of the card title. */
export interface ICardTitleComponents {
    /** The title. */
    onRender: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link ICardTitleComponents}. */
export const CardTitleComponents: ICardTitleComponents = {
    onRender: props => <span {...props} />,
};
