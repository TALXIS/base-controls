import { Tabs } from "../../../../components/adapters";
import { XrmTab } from "../xrm-tab";
import { useTabs } from "./useTabs";

export const XrmTabs = () => {
    const tabs = useTabs();
    const selectedTab = tabs.getExpandedTab();

    return <Tabs key={selectedTab.id} expandedTab={selectedTab.id} onChangeTab={(tabId) => tabs.setExpandedTab(tabId)}>
        {tabs.getVisibleTabs().map(tab => <XrmTab id={tab.id} key={tab.id} tab={tab} label={tab.getLabel() ?? undefined} />)}
    </Tabs>
}