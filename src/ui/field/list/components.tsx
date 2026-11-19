/** The replaceable pieces of the field list. */
export interface IFieldListComponents {
    /** Holds the rows. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IFieldListComponents}. */
export const FieldListComponents: IFieldListComponents = {
    onRender: props => <div {...props} />,
};
