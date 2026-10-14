import { Children, isValidElement } from "react";
import { HeaderItem } from "./HeaderItem";

/** Wraps each child in a box of its own, so the header can hide them one by one. */
export const HeaderItems = (props: { children?: React.ReactNode }) => <>
    {Children.toArray(props.children).map((child, index) => <HeaderItem key={isValidElement(child) ? child.key : index}>{child}</HeaderItem>)}
</>;
