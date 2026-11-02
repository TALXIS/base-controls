import { CommandBarButton, IButtonProps } from "@fluentui/react";

/** The replaceable pieces of {@link RecordList}. */
export interface IRecordListComponents {
    /** The button that picks one record. */
    onRenderRecord: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IRecordListComponents}. */
export const RecordListComponents: IRecordListComponents = {
    onRenderRecord: props => <CommandBarButton {...props} />,
};
