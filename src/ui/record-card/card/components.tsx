/** The replaceable pieces of the record card. */
export interface IRecordCardComponents {
    /** The card's box. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IRecordCardComponents}. */
export const RecordCardComponents: IRecordCardComponents = {
    onRender: props => <div {...props} />,
};
