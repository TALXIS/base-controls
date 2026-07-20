import { useMemo } from "react"
import { XrmForm as XrmFormClass } from '../../Form'
import { FORM_XML } from './formXml'
import { Form, Tabs } from "../../../../components";
import { useEventEmitter } from "../../../../../../hooks";
import { useRerender } from "@talxis/react-components";
import { XrmTab } from "./xrm-tab/XrmTab";


//here we are expecting all dependencies such as labels metadata etc to be loaded
export const XrmForm = () => {
    const form = useMemo(() => new XrmFormClass({ formXml: FORM_XML, lcid: 1029 }), []);
    const tabs = form.tabs;
    const selectedTab = form.tabs.getExpandedTab();
    const rerender = useRerender();
    
    useEventEmitter(tabs.events, ['onTabChange', 'onTabSetVisible'], rerender);

    return <Form>
        <Tabs expandedTab={selectedTab.id} onChangeTab={(tabId) => tabs.setExpandedTab(tabId)}>
            {tabs.getVisibleTabs().map(tab => <XrmTab id={tab.id} key={tab.id} tab={tab} label={tab.getLocalizedLabel() ?? undefined} />)}
        </Tabs>
    </Form>
}