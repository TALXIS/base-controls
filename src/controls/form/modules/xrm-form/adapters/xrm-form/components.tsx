import { ControlComponents, RibbonComponents, FormNotificationsComponents } from "../../../../adapters";
import { IXrmFormComponents } from "../../interfaces";
import { FormUiTabComponents } from "../../../../ui";

export const XrmFormComponents: IXrmFormComponents = {
    control: ControlComponents,
    tabs: FormUiTabComponents,
    ribbon: RibbonComponents,
    notifications: FormNotificationsComponents
}