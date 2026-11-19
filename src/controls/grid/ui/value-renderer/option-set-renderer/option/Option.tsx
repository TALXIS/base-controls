import { Field } from "@ui";
import { IOptionProps } from "../OptionSetRenderer";

/** One option of a cell's set, as the tag every option is drawn as. */
export const Option = (props: IOptionProps) => {
    return <Field.OptionSet label={props.option.label} color={props.option.color} />;
};
