import { FormUi, ITabProps } from "@controls/form/components/ui";

export type { ITabProps } from "@controls/form/components/ui";

export const Tab = (props: ITabProps) => {
    return <FormUi.Tab {...props} />;
};
