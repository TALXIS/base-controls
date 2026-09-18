import { ControlComponents, RibbonComponents, FormNotificationsComponents } from "@controls/form/components/adapters";
import { IXrmFormComponents } from "../../../interfaces";
import { TabComponents } from "@controls/form/components/ui";

export const XrmFormComponents: IXrmFormComponents = {
    control: ControlComponents,
    tabs: TabComponents,
    ribbon: RibbonComponents,
    notifications: FormNotificationsComponents
}