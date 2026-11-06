import { FormUi, IFormUiTabProps } from "../../ui";

export type { IFormUiTabProps } from "../../ui";

export const Tab = (props: IFormUiTabProps) => {
    return <FormUi.Tab {...props} />;
};
