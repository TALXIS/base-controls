import { useMemo } from "react";
import { getColorfulOptionsStyles } from "./styles";
import { IMultiSelectOptionSetProperty } from "../../../interfaces";

interface IColorfulOptionsProps {
    value: IMultiSelectOptionSetProperty
}

export const ColorfulOptions = (props: IColorfulOptionsProps) => {
    const styles = useMemo(() => getColorfulOptionsStyles(), []);
    const { value } = props;
    return <>
        {value.raw?.map((value, index) => (
            <span >{value} </span>
        ))}
    </>
}