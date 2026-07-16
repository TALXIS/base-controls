import { TabContext } from "./context";
import { useFormComponent } from "../../form/useFormComponent";

export interface ITabProps {
    id: string;
    name?: string;
    group?: string;
    verticalLayout?: boolean;
    showLabel?: boolean;
    labelId?: string;
    isUserDefined?: string;
    lockLevel?: number;
    addedBy?: string;
    expanded?: boolean;
    visible?: boolean;
    availableForPhone?: boolean;
    collapsible?: boolean;
    label?: string;
    children?: React.ReactNode;
}

export const Tab = (props: ITabProps) => {
    const tab = useFormComponent('Tab', props);
    const { children } = props;
    return <TabContext.Provider value={tab}>
        {children}
    </TabContext.Provider>
}
