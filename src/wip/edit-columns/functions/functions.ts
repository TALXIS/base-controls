import { getLabels, ILabels } from "./getLabels";

export interface IFunctions {
    getLabels: () => ILabels;
}
    
export const functions: IFunctions = {
    getLabels: () => getLabels(),
}