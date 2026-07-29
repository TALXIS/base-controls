import { FormUi, IColumnProps } from "@components/Form/components/ui";

export type { IColumnProps } from "@components/Form/components/ui";

export const Column = (props: IColumnProps) => {
    return <FormUi.Column {...props} />;
};
