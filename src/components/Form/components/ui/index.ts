//ui components do not have any dependencies on the form, so they can be used in other contexts as well

import { Cell } from "./cell";

export * from "./cell";
    
export interface IFormUi {
    Cell: typeof Cell;
}

export const FormUi: IFormUi = {
    Cell
}