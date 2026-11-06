import { FormXmlForm } from '../../runtime/form-xml-form';
import { Form } from "../../../../Form";
import { useEventEmitter, useRerender } from "@core";
import { usePcfContext } from "@pcf";
import React from "react";
import type { IXrmFormComponents, IXrmFormContext, IXrmFormProps } from '../../interfaces';
import type { IXrmFormContextInternal } from '../../runtime/xrm-context/XrmFormContext';
import { createXrmFormContext } from '../../runtime/xrm-context/XrmFormContext';
import { XrmNotifications } from '../xrm-notifications';
import { FormXmlContext, XrmFormContext } from '../context';
import { XrmTabs } from '../xrm-tabs';
import { XrmRibbon } from '../xrm-ribbon';
import { IFormApi } from '../../../../interfaces';
import { IFormApiInternal } from '../../../../runtime/FormApi';
import { XrmFormComponentsContext } from './context';
import { XrmFormComponents } from "./components";


export const XrmForm = (props: IXrmFormProps) => {
    const components = {...XrmFormComponents, ...props.components};
    const [form, setForm] = React.useState<{ xmlModel: FormXmlForm, xrmFormContext: IXrmFormContextInternal } | null>(null);
    const pcfContext = usePcfContext();
    const formXmlRef = React.useRef('');

    const onLoad = async () => {
        const result = await props.onLoad();
        formXmlRef.current = result.formXml;
        return result;
    };

    const onFormReady = (api: IFormApi) => {
        const form = (api as IFormApiInternal)._getForm();
        const nextFormXmlModel = new FormXmlForm({ formXml: formXmlRef.current, lcid: pcfContext.userSettings.languageId, form });
        const formContext = createXrmFormContext(nextFormXmlModel);
        setForm({ xmlModel: nextFormXmlModel, xrmFormContext: formContext });
        props.onFormReady?.({ formContext, api });
    }

    return <Form.Root
        onLoad={onLoad}
        enableAutoSave={props.enableAutoSave}
        onAfterSave={props.onAfterSave}
        onBeforeSave={props.onBeforeSave}
        onDirtyStateChanged={props.onDirtyStateChanged}
        onError={props.onError}
        onFieldValueChanged={props.onFieldValueChanged}
        onFormReady={onFormReady}
        onValidationSummaryChanged={props.onValidationSummaryChanged}
    >
        {form && <XrmFormInternal formXmlModel={form.xmlModel} xrmFormContext={form.xrmFormContext} components={components} />}
    </Form.Root>
}

const XrmFormInternal = ({
    formXmlModel,
    xrmFormContext,
    components,
}: {
    formXmlModel: FormXmlForm,
    xrmFormContext: IXrmFormContextInternal,
    components: IXrmFormComponents
}) => {
    const { rerender } = useRerender();

    useEventEmitter(formXmlModel.events, ['onRenderRequested'], rerender);
    React.useEffect(() => {
        xrmFormContext.data.fireOnLoad();
        xrmFormContext.ui.fireOnLoad();
    }, []);

    return <FormXmlContext.Provider value={formXmlModel}>
        <XrmFormContext.Provider value={xrmFormContext}>
            <XrmFormComponentsContext.Provider value={components}>
                <XrmRibbon />
                <XrmNotifications />
                <XrmTabs />
            </XrmFormComponentsContext.Provider>
        </XrmFormContext.Provider>
    </FormXmlContext.Provider>
}