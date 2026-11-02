import { IRecordListComponents, IRecordListProps, IRecordSelectorFrameComponents, RecordList } from "../../../ui";

/** The replaceable pieces of {@link RecordSelector}. */
export interface IRecordSelectorComponents {
    /** The records of the current page. */
    onRenderList: (props: IRecordListProps) => JSX.Element | null;
    frame?: Partial<IRecordSelectorFrameComponents>;
    list?: Partial<IRecordListComponents>;
}

/** The defaults for {@link IRecordSelectorComponents}. */
export const RecordSelectorComponents: IRecordSelectorComponents = {
    onRenderList: props => <RecordList {...props} />,
};
