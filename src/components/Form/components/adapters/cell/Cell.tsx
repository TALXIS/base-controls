import { ICellProps } from "@components/Form/components/ui/cell";
import { FormUi } from "@components/Form/components/ui";
import { useField } from "../field";
import { FormModel } from "@components/Form/internal/FormModel";

export const Cell = (props: ICellProps) => {
    const field = useField();
    const hasExplicitLabelProp = Object.prototype.hasOwnProperty.call(props, "label");
    
    const label = hasExplicitLabelProp ? props.label : field?.getColumn().displayName;
    const { requiredLevel = FormModel.getRequiredLevelEnumFromXrm(field?.getRequiredLevel())} = props;

    return <FormUi.Cell {...props} requiredLevel={requiredLevel} label={label} />
}