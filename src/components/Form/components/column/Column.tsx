import * as React from "react";
import { useColumnsContext } from "../columns";
import { ColumnContext } from "./context";

export interface IFormColumnProps {
    width: string;
    children?: React.ReactNode;
}

export const Column = (props: IFormColumnProps) => {
    const childrenArray = React.Children.toArray(props.children).filter(child => React.isValidElement(child));
}
