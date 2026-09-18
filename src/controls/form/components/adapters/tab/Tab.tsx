import { FormUi, ITabProps } from "@components/Form/components/ui";

export type { ITabProps } from "@components/Form/components/ui";

export const Tab = (props: ITabProps) => {
    return <FormUi.Tab {...props} />;
};
