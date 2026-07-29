import { usePcfContext } from "@utils";
import { FormUi, IFormTabsProps, TabLikeChild } from "@components/Form/components/ui";

export type { IFormTabsProps, TabLikeChild } from "@components/Form/components/ui";

export const Tabs = (props: IFormTabsProps) => {
    const pcfContext = usePcfContext();
    console.log("PCF Context in Tabs:", pcfContext); // Debugging line to check the context value
    return <FormUi.Tabs {...props} />;
};
