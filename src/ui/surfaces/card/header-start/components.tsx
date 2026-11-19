/** The replaceable pieces of the header's start. */
export interface ICardHeaderStartComponents {
    /** The header's start. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICardHeaderStartComponents}. */
export const CardHeaderStartComponents: ICardHeaderStartComponents = {
    onRender: props => <div {...props} />,
};
