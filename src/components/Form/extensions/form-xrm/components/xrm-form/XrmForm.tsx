import { useMemo } from "react"
import { XrmForm as XrmFormClass } from '../../Form'
import { FORM_XML } from './formXml'
import { Form, Tabs, Tab, Column } from "../../../../components";
import { useEventEmitter } from "../../../../../../hooks";
import { useRerender } from "@talxis/react-components";


//here we are expecting all dependencies such as labels metadata etc to be loaded
export const XrmForm = () => {
    const form = useMemo(() => new XrmFormClass({ formXml: FORM_XML, lcid: 1033 }), []);
    const tabs = form.tabs;
    const selectedTab = form.tabs.getExpandedTab();
    const visibleTabs = tabs.tab.filter(t => t.visible !== false);
    const rerender = useRerender();
    
    useEventEmitter(tabs.events, ['onTabChange'], rerender);

    return <Form>
        <Tabs expandedTab={selectedTab.id} onChangeTab={(tabId) => tabs.setExpandedTab(tabId)}>
            {visibleTabs.map(tab => <Tab layout={{
                lg: tab.getColumns().length,
            }} key={tab.id} id={tab.id} label={tab.getLocalizedLabel() ?? undefined}>
                {tab.getColumns().map(col => <Column colspan={col.getColspan()}>
                    Column
                </Column>)}
            </Tab>)}
        </Tabs>
    </Form>
}