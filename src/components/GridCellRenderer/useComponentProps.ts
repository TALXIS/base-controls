import { createContext, useContext } from "react";
import { IGridCellRendererComponentProps } from "./interfaces";


export const ComponentPropsContext = createContext<{
    current: IGridCellRendererComponentProps
}>({} as any);

export const useComponentProps = () => {
    const context = useContext(ComponentPropsContext);
    return context.current;
}