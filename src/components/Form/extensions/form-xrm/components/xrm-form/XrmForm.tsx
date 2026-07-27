import { FormXmlForm } from '../../FormXmlForm'
import { Form } from "../../../../components";
import { useEventEmitter } from "../../../../../../hooks";
import { useRerender } from "@talxis/react-components";
import { IFormStrategy } from "../../../../stragegies";
import React from "react";
import { IForm } from '../../../../Form';
import { XrmFormContext } from '../../../XrmContext';
import { XrmNotifications } from './xrm-notifications/XrmNotifications';
import { FormXmlContext } from './context';
import { XrmTabs } from './xrm-tabs/XrmTabs';
import { XrmRibbon } from './xrm-ribbon';



export interface IXrmFormStrategy extends IFormStrategy {
    //will run after onload
    onGetFormXml: () => string;
}

interface IXrmFormProps {
    strategy: IXrmFormStrategy;
    onFormReady?: (formContext: XrmFormContext) => void;
}


export const XrmForm = (props: IXrmFormProps) => {
    const { strategy } = props;
    const [formXmlModel, setFormXmlModel] = React.useState<FormXmlForm | null>(null);

    const onFormReady = (form: IForm) => {
        const formXml = strategy.onGetFormXml();
        const nextFormXmlModel = new FormXmlForm({ formXml, lcid: 1029, form });
        const formContext = new XrmFormContext(nextFormXmlModel);
        props.onFormReady?.(formContext);
        setFormXmlModel(nextFormXmlModel);
    }

    return <Form strategy={strategy} onFormReady={onFormReady}>
        {formXmlModel && <XrmFormInternal formXmlModel={formXmlModel} />}
    </Form>
}

const XrmFormInternal = ({ formXmlModel }: { formXmlModel: FormXmlForm }) => {
    const rerender = useRerender();

    useEventEmitter(formXmlModel.events, ['onRenderRequested'], rerender);

    return <FormXmlContext.Provider value={formXmlModel}>
        <XrmRibbon />
        <XrmNotifications />
        <XrmTabs />
    </FormXmlContext.Provider>
}