import { IFormXmlControl } from "@components/Form/extensions/xrm-form/internal/form-xml-form";
import { Form } from "@components/Form/components/Form";
import { useXrmControl } from "./useXrmControl";
import { useXrmFormComponents } from "../xrm-form/context";
import { usePcfContext } from "@utils";
import { MessageBar, MessageBarType } from "@fluentui/react";
import type { IBinding } from "@components/NestedControlRenderer/interfaces";

export const XrmControl = (props: {control: IFormXmlControl}) => {
    const control = useXrmControl(props.control);
    const components = useXrmFormComponents();
    const context = usePcfContext();
    let customControlName: string | undefined;
    let customControlParameters: Record<string, IBinding> | undefined;
    try {
        const formFactor = context.client.getFormFactor();
        customControlName = control.getControlName(formFactor);
        customControlParameters = control.getControlParameters(formFactor);
    } catch (error) {
        return <MessageBar messageBarType={MessageBarType.error}>
            Custom control "{control.id}": {error instanceof Error ? error.message : 'Unsupported configuration.'}
        </MessageBar>;
    }

    return <Form.Control 
        id={control.id}
        customControlName={customControlName}
        customControlParameters={customControlParameters}
        disabled={control.getDisabled()} 
        components={components?.control} />
}