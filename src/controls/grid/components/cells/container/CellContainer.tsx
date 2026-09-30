import { CellUi, ICellUiContainerComponents } from "../ui";
import { useGridCell } from "../root/context";
import { CellContainerProvider } from "./context";

export interface ICellContainerProps {
    children?: React.ReactNode;
    components?: Partial<ICellUiContainerComponents>;
}

/** The element a cell's content is drawn in, and the surface it is drawn on. */
export const CellContainer = (props: ICellContainerProps) => {
    //called only to throw outside a cell root
    useGridCell();

    //what is inside a cell and what wraps one are not interchangeable
    return <CellContainerProvider value={true}>
        <CellUi.Container components={props.components}>{props.children}</CellUi.Container>
    </CellContainerProvider>;
};
