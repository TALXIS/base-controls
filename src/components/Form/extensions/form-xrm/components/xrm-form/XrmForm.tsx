import { FormXmlForm } from '@components/Form/extensions/form-xrm/internal/FormXmlForm';
import { Form } from "@components/Form/components/Form";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { IFormStrategy } from "@components/Form/stragegies";
import React from "react";
import { IFormEvents } from '@components/Form/internal/FormModel';
import type { IXrmFormContext } from '@components/Form/extensions/form-xrm/xrm-context/interfaces';
import type { IXrmFormContextInternal } from '@components/Form/extensions/form-xrm/xrm-context/XrmFormContext';
import { createXrmFormContext } from '@components/Form/extensions/form-xrm/xrm-context/XrmFormContext';
import { XrmNotifications } from '../xrm-notifications';
import { FormXmlContext, XrmFormContext } from '../context';
import { XrmTabs } from '../xrm-tabs';
import { XrmRibbon } from '../xrm-ribbon';
import { IFormApi } from '@components/Form/interfaces';
import { IFormApiInternal } from '@components/Form/internal/FormApi';
import { IFormLabels } from '@components/Form/labels';

export interface IXrmFormStrategy extends IFormStrategy {
    //will run after onload
    onGetFormXml: () => string;
}

export interface IOnFormReadyParams {
    formContext: IXrmFormContext;
    api: IFormApi;
}

interface IXrmFormProps {
    strategy: IXrmFormStrategy;
    onFormReady?: (params: IOnFormReadyParams) => void;
    onAfterSave?: IFormEvents["onAfterSave"];
    labels?: Partial<IFormLabels>;
}


export const XrmForm = (props: IXrmFormProps) => {
    const { strategy } = props;
    const [form, setForm] = React.useState<{ xmlModel: FormXmlForm, xrmFormContext: IXrmFormContextInternal } | null>(null);

    const onFormReady = (api: IFormApi) => {
        const form = (api as IFormApiInternal)._getForm();
        const formXml = strategy.onGetFormXml();
        const nextFormXmlModel = new FormXmlForm({ formXml, lcid: 1029, form });
        const formContext = createXrmFormContext(nextFormXmlModel);
        setForm({ xmlModel: nextFormXmlModel, xrmFormContext: formContext });
        props.onFormReady?.({ formContext, api });
    }

    return <Form.Root strategy={strategy} onFormReady={onFormReady} onAfterSave={props.onAfterSave} labels={props.labels}>
        {form && <XrmFormInternal formXmlModel={form.xmlModel} xrmFormContext={form.xrmFormContext} />}
    </Form.Root>
}

const XrmFormInternal = ({ formXmlModel, xrmFormContext }: { formXmlModel: FormXmlForm, xrmFormContext: IXrmFormContextInternal }) => {
    const rerender = useRerender();

    useEventEmitter(formXmlModel.events, ['onRenderRequested'], rerender);
    React.useEffect(() => {
        xrmFormContext.data.fireOnLoad();
        xrmFormContext.ui.fireOnLoad();
    }, []);

    return <FormXmlContext.Provider value={formXmlModel}>
        <XrmFormContext.Provider value={xrmFormContext}>
            <XrmRibbon />
            <XrmNotifications />
            <XrmTabs />
        </XrmFormContext.Provider>
    </FormXmlContext.Provider>
}