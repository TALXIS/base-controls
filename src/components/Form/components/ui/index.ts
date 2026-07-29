//ui components do not have any dependencies on the form, so they can be used in other contexts as well

import { Cell, ICellProps } from "./cell";
    
export interface IFormUi {
    Cell: React.FC<ICellProps>;
}

export const FormUi: IFormUi = {
    Cell: Cell
}