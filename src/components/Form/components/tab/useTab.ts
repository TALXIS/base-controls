import { useForm } from "../../form/context";

export const useTab = (tabId: string) => {
   const form = useForm();
   const tab = form.getTab(tabId);
    if (!tab) {
         throw new Error(`[Form] Tab with id "${tabId}" not found.`);
    }
    return tab;
}