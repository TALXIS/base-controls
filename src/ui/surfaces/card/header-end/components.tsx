/** The replaceable pieces of the header's end. */
export interface ICardHeaderEndComponents {
    /** The header's end. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICardHeaderEndComponents}. */
export const CardHeaderEndComponents: ICardHeaderEndComponents = {
    onRender: props => <div {...props} />,
};
