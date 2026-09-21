import { useGridCell } from "../root/context";
import { CellContainerComponents, ICellContainerComponents } from "./components";
import { CellContainerProvider } from "./context";

export interface ICellContainerProps {
    children?: React.ReactNode;
    components?: Partial<ICellContainerComponents>;
}

/** The element a cell's content is drawn in, and the surface it is drawn on. */
export const CellContainer = (props: ICellContainerProps) => {
    //asked for rather than used: it throws outside a cell root
    useGridCell();
    const components = { ...CellContainerComponents, ...props.components };

    //what is inside a cell and what wraps one are not interchangeable
    return <CellContainerProvider value={true}>
        {components.onRenderContainer({ children: props.children })}
    </CellContainerProvider>;
};
