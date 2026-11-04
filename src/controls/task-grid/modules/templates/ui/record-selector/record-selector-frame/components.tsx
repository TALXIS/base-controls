/** The replaceable pieces of {@link RecordSelectorFrame}. */
export interface IRecordSelectorFrameComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IRecordSelectorFrameComponents}. */
export const RecordSelectorFrameComponents: IRecordSelectorFrameComponents = {
    onRenderContainer: props => <div {...props} />,
};
