/** The replaceable pieces of the record card. */
export interface IRecordCardComponents {
    /** The card's box. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IRecordCardComponents}. */
export const RecordCardComponents: IRecordCardComponents = {
    onRenderContainer: props => <div {...props} />,
};
