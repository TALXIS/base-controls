/** The replaceable pieces of the tooltip's field rows. */
export interface IRecordCardFieldRowsComponents {
    /** Holds the rows. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IRecordCardFieldRowsComponents}. */
export const RecordCardFieldRowsComponents: IRecordCardFieldRowsComponents = {
    onRenderContainer: props => <div {...props} />,
};
