import { FormUi, IFormUiColumnProps } from "../../ui";

export type { IFormUiColumnProps } from "../../ui";

export const Column = (props: IFormUiColumnProps) => {
    return <FormUi.Column {...props} />;
};
