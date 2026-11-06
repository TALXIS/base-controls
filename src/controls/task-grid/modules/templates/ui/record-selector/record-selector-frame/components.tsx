/** The replaceable pieces of {@link RecordSelectorFrame}. */
export interface ITemplatesUiRecordSelectorFrameComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ITemplatesUiRecordSelectorFrameComponents}. */
export const TemplatesUiRecordSelectorFrameComponents: ITemplatesUiRecordSelectorFrameComponents = {
    onRenderContainer: props => <div {...props} />,
};
