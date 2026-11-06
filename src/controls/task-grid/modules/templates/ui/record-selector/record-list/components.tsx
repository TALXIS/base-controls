import { CommandBarButton, IButtonProps } from "@fluentui/react";

/** The replaceable pieces of {@link RecordList}. */
export interface ITemplatesUiRecordListComponents {
    /** The button that picks one record. */
    onRenderRecord: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link ITemplatesUiRecordListComponents}. */
export const TemplatesUiRecordListComponents: ITemplatesUiRecordListComponents = {
    onRenderRecord: props => <CommandBarButton {...props} />,
};
