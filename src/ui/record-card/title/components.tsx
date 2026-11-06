/** The replaceable pieces of the title. */
export interface IRecordCardTitleComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link IRecordCardTitleComponents}. */
export const RecordCardTitleComponents: IRecordCardTitleComponents = {
    onRenderContainer: props => <span {...props} />,
};
