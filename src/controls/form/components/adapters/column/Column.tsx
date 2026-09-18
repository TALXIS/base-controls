import { FormUi, IColumnProps } from "@controls/form/components/ui";

export type { IColumnProps } from "@controls/form/components/ui";

export const Column = (props: IColumnProps) => {
    return <FormUi.Column {...props} />;
};
