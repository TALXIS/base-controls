import { ICellProps } from "../../ui/cell";
import { FormUi } from "../../ui";
import { useField } from "../field";
import { FormRuntime } from "../../runtime/FormRuntime";
import { useForm } from "../root/context";

export const Cell = (props: ICellProps) => {
    const field = useField();
    const form = useForm();
    const hasExplicitLabelProp = Object.prototype.hasOwnProperty.call(props, "label");
    
    const label = hasExplicitLabelProp ? props.label : field?.getColumn().displayName;
    const { requiredLevel = FormRuntime.getRequiredLevelEnumFromXrm(field ? form.getFieldRequiredLevel(field.getColumn().name) : undefined)} = props;

    return <FormUi.Cell {...props} requiredLevel={requiredLevel} label={label} />
}