import { FormXmlForm } from '../../FormXmlForm'
import { Form, Notifications, Ribbon, Tabs } from "../../../../components";
import { useEventEmitter } from "../../../../../../hooks";
import { useRerender } from "@talxis/react-components";
import { XrmTab } from "./xrm-tab/XrmTab";
import { IFormStrategy } from "../../../../stragegies";
import React from "react";
import { IForm } from '../../../../Form';



export interface IXrmFormStrategy extends IFormStrategy {
    //will run after onload
    onGetFormXml: () => string;
}

interface IXrmFormProps {
    strategy: IXrmFormStrategy;
}


//here we are expecting all dependencies such as labels metadata etc to be loaded
export const XrmForm = (props: IXrmFormProps) => {
    const { strategy } = props;
    const [formXmlModel, setFormXmlModel] = React.useState<FormXmlForm | null>(null);

    const onFormReady = (form: IForm) => {
        const formXml = strategy.onGetFormXml();
        const nextFormXmlModel = new FormXmlForm({ formXml, lcid: 1029, form });
        setFormXmlModel(nextFormXmlModel);
        //@ts-ignore
        window.form = nextFormXmlModel;
    }

    return <Form strategy={strategy} onFormReady={onFormReady}>
        {formXmlModel && <XrmFormInternal formXmlModel={formXmlModel} />}
    </Form>
}

const XrmFormInternal = ({ formXmlModel }: { formXmlModel: FormXmlForm }) => {
    const tabs = formXmlModel.tabs;
    const selectedTab = formXmlModel.tabs.getExpandedTab();
    const rerender = useRerender();

    useEventEmitter(formXmlModel.events, ['onRenderRequested'], rerender);
    useEventEmitter(tabs.events, ['onTabChange', 'onTabSetVisible'], rerender);

    return <>
        <Notifications />
        <Ribbon />
        <Tabs expandedTab={selectedTab.id} onChangeTab={(tabId) => tabs.setExpandedTab(tabId)}>
            {tabs.getVisibleTabs().map(tab => <XrmTab id={tab.id} key={tab.id} tab={tab} label={tab.getLabel() ?? undefined} />)}
        </Tabs>
    </>
}