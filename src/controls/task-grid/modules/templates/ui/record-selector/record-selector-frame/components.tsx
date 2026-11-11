/** The replaceable pieces of {@link RecordSelectorFrame}. */
export interface ITemplatesUiRecordSelectorFrameComponents {
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ITemplatesUiRecordSelectorFrameComponents}. */
export const TemplatesUiRecordSelectorFrameComponents: ITemplatesUiRecordSelectorFrameComponents = {
    onRender: props => <div {...props} />,
};
