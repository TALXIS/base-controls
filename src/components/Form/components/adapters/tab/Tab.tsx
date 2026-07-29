import { FormUi, ITabProps } from "../../ui";

export type { ITabProps } from "../../ui";

export const Tab = (props: ITabProps) => {
    return <FormUi.Tab {...props} />;
};
