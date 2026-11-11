/** The replaceable pieces of the tooltip's field rows. */
export interface IRecordCardFieldRowsComponents {
    /** Holds the rows. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IRecordCardFieldRowsComponents}. */
export const RecordCardFieldRowsComponents: IRecordCardFieldRowsComponents = {
    onRender: props => <div {...props} />,
};
