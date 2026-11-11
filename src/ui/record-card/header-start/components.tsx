/** The replaceable pieces of the header's start. */
export interface IRecordCardHeaderStartComponents {
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IRecordCardHeaderStartComponents}. */
export const RecordCardHeaderStartComponents: IRecordCardHeaderStartComponents = {
    onRender: props => <div {...props} />,
};
