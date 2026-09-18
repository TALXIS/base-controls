import { FormUi, IFormTabsProps, TabLikeChild } from "@components/Form/components/ui";

export type { IFormTabsProps, TabLikeChild } from "@components/Form/components/ui";

export const Tabs = (props: IFormTabsProps) => {
    return <FormUi.Tabs {...props} />;
};
