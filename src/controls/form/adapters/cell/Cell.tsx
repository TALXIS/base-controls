import { ICellProps } from "../../ui/cell";
import { FormUi } from "../../ui";
import { useField } from "../field";
import { FormModel } from "../../runtime/FormModel";
import { useForm } from "../root/context";

export const Cell = (props: ICellProps) => {
    const field = useField();
    const form = useForm();
    const hasExplicitLabelProp = Object.prototype.hasOwnProperty.call(props, "label");
    
    const label = hasExplicitLabelProp ? props.label : field?.getColumn().displayName;
    const { requiredLevel = FormModel.getRequiredLevelEnumFromXrm(field ? form.getFieldRequiredLevel(field.getColumn().name) : undefined)} = props;

    return <FormUi.Cell {...props} requiredLevel={requiredLevel} label={label} />
}