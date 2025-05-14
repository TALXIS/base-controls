import { useMemo } from "react";
import { getColorfulOptionsStyles } from "./styles";
import { IMultiSelectOptionSetProperty } from "../../../interfaces";

interface IColorfulOptionsProps {
    value: IMultiSelectOptionSetProperty
}

export const ColorfulOptions = (props: IColorfulOptionsProps) => {
    const styles = useMemo(() => getColorfulOptionsStyles(), []);
    const { value } = props;
    const options = value.attributes.Options;
    return <div>
        {value.raw?.map((value, index) => (
            <span>{options.find(option => option.Value == value)?.Label} </span>
        ))}
    </div>
}