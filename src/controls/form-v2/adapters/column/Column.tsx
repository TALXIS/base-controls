import { FormV2Ui, IFormV2UiColumnProps } from "../../ui";

/** Props for `FormV2.Column`. */
export interface IColumnProps extends IFormV2UiColumnProps { }

/** A column of sections inside a tab. */
export const Column = (props: IColumnProps) => {
    return <FormV2Ui.Column {...props} />;
};
