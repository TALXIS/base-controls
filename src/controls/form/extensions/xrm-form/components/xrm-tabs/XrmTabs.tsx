import { Form } from "@components/Form/components/Form";
import { XrmTab } from "../xrm-tab";
import { useTabs } from "./useTabs";
import { useXrmFormComponents } from "../xrm-form/context";

export const XrmTabs = () => {
    const tabs = useTabs();
    const selectedTab = tabs.getExpandedTab();
    const components = useXrmFormComponents();

    return <Form.Tabs components={components.tabs} expandedTab={selectedTab.id} onTabChange={(tabId) => tabs.setExpandedTab(tabId)}>
        {tabs.getVisibleTabs().map(tab => <XrmTab id={tab.id} key={tab.id} tab={tab} label={tab.getLabel() ?? undefined} />)}
    </Form.Tabs>
}