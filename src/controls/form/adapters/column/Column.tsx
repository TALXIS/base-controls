import { FormUi, IColumnProps } from "../../ui";

export type { IColumnProps } from "../../ui";

export const Column = (props: IColumnProps) => {
    return <FormUi.Column {...props} />;
};
