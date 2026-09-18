import { ICellProps } from "@controls/form/components/ui/cell";
import { FormUi } from "@controls/form/components/ui";
import { useField } from "../field";
import { FormModel } from "@controls/form/internal/FormModel";

export const Cell = (props: ICellProps) => {
    const field = useField();
    const hasExplicitLabelProp = Object.prototype.hasOwnProperty.call(props, "label");
    
    const label = hasExplicitLabelProp ? props.label : field?.getColumn().displayName;
    const { requiredLevel = FormModel.getRequiredLevelEnumFromXrm(field?.getRequiredLevel())} = props;

    return <FormUi.Cell {...props} requiredLevel={requiredLevel} label={label} />
}