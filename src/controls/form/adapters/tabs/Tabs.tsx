import { FormUi, IFormTabsProps, TabLikeChild } from "../../ui";

export type { IFormTabsProps, TabLikeChild } from "../../ui";

export const Tabs = (props: IFormTabsProps) => {
    return <FormUi.Tabs {...props} />;
};
