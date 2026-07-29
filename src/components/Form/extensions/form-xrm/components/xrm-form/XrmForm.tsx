import { FormXmlForm } from '../../FormXmlForm'
import { Form } from "../../../../components";
import { useEventEmitter } from "../../../../../../hooks";
import { useRerender } from "@talxis/react-components";
import { IFormStrategy } from "../../../../stragegies";
import React from "react";
import { IForm } from '../../../../Form';
import { XrmFormContext as XrmFormContextClass } from '../../xrm-context';
import { XrmNotifications } from '../xrm-notifications/XrmNotifications';
import { FormXmlContext, XrmFormContext } from '../context';
import { XrmTabs } from '../xrm-tabs/XrmTabs';
import { XrmRibbon } from '../xrm-ribbon';
import { IFormApi, IFormApiInternal } from '../../../../FormApi';
import { IFormEvents } from '../../../../Form';



export interface IXrmFormStrategy extends IFormStrategy {
    //will run after onload
    onGetFormXml: () => string;
}

export interface IOnFormReadyParams {
    formContext: XrmFormContextClass;
    api: IFormApi;
}

interface IXrmFormProps {
    strategy: IXrmFormStrategy;
    onFormReady?: (params: IOnFormReadyParams) => void;
    onAfterSave?: IFormEvents["onAfterSave"];
}


export const XrmForm = (props: IXrmFormProps) => {
    const { strategy } = props;
    const [form, setForm] = React.useState<{ xmlModel: FormXmlForm, xrmFormContext: XrmFormContextClass } | null>(null);

    const onFormReady = (api: IFormApi) => {
        const form = (api as IFormApiInternal)._getForm();
        const formXml = strategy.onGetFormXml();
        const nextFormXmlModel = new FormXmlForm({ formXml, lcid: 1029, form });
        const formContext = new XrmFormContextClass(nextFormXmlModel);
        setForm({ xmlModel: nextFormXmlModel, xrmFormContext: formContext });
        props.onFormReady?.({ formContext, api });
    }

    return <Form.Root strategy={strategy} onFormReady={onFormReady} onAfterSave={props.onAfterSave}>
        {form && <XrmFormInternal formXmlModel={form.xmlModel} xrmFormContext={form.xrmFormContext} />}
    </Form.Root>
}

const XrmFormInternal = ({ formXmlModel, xrmFormContext }: { formXmlModel: FormXmlForm, xrmFormContext: XrmFormContextClass }) => {
    const rerender = useRerender();

    useEventEmitter(formXmlModel.events, ['onRenderRequested'], rerender);

    return <FormXmlContext.Provider value={formXmlModel}>
        <XrmFormContext.Provider value={xrmFormContext}>
            <XrmRibbon />
            <XrmNotifications />
            <XrmTabs />
        </XrmFormContext.Provider>
    </FormXmlContext.Provider>
}