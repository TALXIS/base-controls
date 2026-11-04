import { ICellProps } from "../../ui/cell";
import { FormUi } from "../../ui";
import { useField } from "../field";
import { FormModel } from "../../runtime/FormModel";

export const Cell = (props: ICellProps) => {
    const field = useField();
    const hasExplicitLabelProp = Object.prototype.hasOwnProperty.call(props, "label");
    
    const label = hasExplicitLabelProp ? props.label : field?.getColumn().displayName;
    const { requiredLevel = FormModel.getRequiredLevelEnumFromXrm(field?.getRequiredLevel())} = props;

    return <FormUi.Cell {...props} requiredLevel={requiredLevel} label={label} />
}