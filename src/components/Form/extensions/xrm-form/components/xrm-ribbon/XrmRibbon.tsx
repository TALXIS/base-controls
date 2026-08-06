import { Form } from "@components/Form/components/Form"
import { useXrmFormContext } from "../context";
import { useXrmFormComponents } from "../xrm-form/context";


//TODO: this on save is wrong, we should have basic ribbon commandbar => taking buttons and rendering them correctly, handling the loadings and etc,
//then have the form ribbon that adds the various events and etc, then we can use that ribbon here and override the ribbon button
export const XrmRibbon = () => {
    const formContext = useXrmFormContext();
    const components = useXrmFormComponents();
    return <Form.Ribbon onSave={() => formContext.data.save()} components={components.ribbon} />
}