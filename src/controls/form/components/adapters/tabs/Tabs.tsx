import { FormUi, IFormTabsProps, TabLikeChild } from "@controls/form/components/ui";

export type { IFormTabsProps, TabLikeChild } from "@controls/form/components/ui";

export const Tabs = (props: IFormTabsProps) => {
    return <FormUi.Tabs {...props} />;
};
