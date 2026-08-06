import { ControlComponents, RibbonComponents, FormNotificationsComponents } from "@components/Form/components/adapters";
import { IXrmFormComponents } from "../../../interfaces";
import { TabComponents } from "@components/Form/components/ui";

export const XrmFormComponents: IXrmFormComponents = {
    control: ControlComponents,
    tabs: TabComponents,
    ribbon: RibbonComponents,
    notifications: FormNotificationsComponents
}