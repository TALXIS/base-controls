/** The replaceable pieces of the title. */
export interface IRecordCardTitleComponents {
    onRender: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link IRecordCardTitleComponents}. */
export const RecordCardTitleComponents: IRecordCardTitleComponents = {
    onRender: props => <span {...props} />,
};
