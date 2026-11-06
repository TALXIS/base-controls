import { Children, isValidElement } from "react";
import { DatasetControlUiHeaderItem } from "./DatasetControlUiHeaderItem";

/** Wraps each child in a box of its own, so the header can hide them one by one. */
export const DatasetControlUiHeaderItems = (props: { children?: React.ReactNode }) => <>
    {Children.toArray(props.children).map((child, index) => <DatasetControlUiHeaderItem key={isValidElement(child) ? child.key : index}>{child}</DatasetControlUiHeaderItem>)}
</>;
