/** The replaceable pieces of the header's end. */
export interface IRecordCardHeaderEndComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IRecordCardHeaderEndComponents}. */
export const RecordCardHeaderEndComponents: IRecordCardHeaderEndComponents = {
    onRenderContainer: props => <div {...props} />,
};
