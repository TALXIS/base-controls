import { getLabels, IPanelLabels } from "./getLabels";

export interface IPanelFunctions {
    onSave: () => void;
    onDismiss: () => void;
    getLabels: () => IPanelLabels;
}

export const functions = {
    onSave: () => { },
    onDismiss: () => { },
    getLabels: getLabels
}