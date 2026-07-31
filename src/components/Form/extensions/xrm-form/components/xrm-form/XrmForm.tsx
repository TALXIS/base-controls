import { FormXmlForm } from '@components/Form/extensions/xrm-form/internal/form-xml-form';
import { Form } from "@components/Form/components/Form";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import React from "react";
import type { IXrmFormContext, IXrmFormProps } from '@components/Form/extensions/xrm-form/interfaces';
import type { IXrmFormContextInternal } from '@components/Form/extensions/xrm-form/internal/xrm-context/XrmFormContext';
import { createXrmFormContext } from '@components/Form/extensions/xrm-form/internal/xrm-context/XrmFormContext';
import { XrmNotifications } from '../xrm-notifications';
import { FormXmlContext, XrmFormContext } from '../context';
import { XrmTabs } from '../xrm-tabs';
import { XrmRibbon } from '../xrm-ribbon';
import { IFormApi } from '@components/Form/interfaces';
import { IFormApiInternal } from '@components/Form/internal/FormApi';


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

    return <Form.Root
        strategy={strategy}
        onAfterSave={props.onAfterSave}
        onBeforeSave={props.onBeforeSave}
        onDirtyStateChanged={props.onDirtyStateChanged}
        onError={props.onError}
        onFieldValueChanged={props.onFieldValueChanged}
        onFormReady={onFormReady}
        onValidationSummaryChanged={props.onValidationSummaryChanged}
        labels={props.labels}
    >
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