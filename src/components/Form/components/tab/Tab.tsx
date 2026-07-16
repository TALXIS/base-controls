import { TabContext } from "./context";

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
    const { children } = props;
    return <TabContext.Provider value={props}>
        {children}
    </TabContext.Provider>
}
