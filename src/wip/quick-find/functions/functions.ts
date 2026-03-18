
import { getLabels, IQuickFindLabels } from "./getLabels";

export interface IQuickFindFunctions {
    getLabels: () => IQuickFindLabels;
}

export const functions: IQuickFindFunctions = {
    getLabels: getLabels
}