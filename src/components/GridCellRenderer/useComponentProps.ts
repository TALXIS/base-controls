import { useContext } from "react";
import { ComponentPropsContext } from "./GridCellRenderer";

export const useComponentProps = () => {
    const context = useContext(ComponentPropsContext);
    return context.current;
}