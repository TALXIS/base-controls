import { OptionTag } from "@ui";
import { IOptionProps } from "../../OptionSetRenderer";

/** One option of a cell's set, as the tag every option is drawn as. */
export const Option = (props: IOptionProps) => {
    return <OptionTag label={props.option.label} color={props.option.color} />;
};
