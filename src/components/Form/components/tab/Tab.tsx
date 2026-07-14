import { TabContext } from "./context";
import type { IFormTabProps } from "../../form/FormModel";
import { useFormComponent } from "../../form/useFormComponent";

export type { IFormTabProps } from "../../form/FormModel";


export const Tab = (props: IFormTabProps) => {
    const tab = useFormComponent('Tab', props);
    const { children } = props;
    return <TabContext.Provider value={tab}>
        {children}
    </TabContext.Provider>
}
