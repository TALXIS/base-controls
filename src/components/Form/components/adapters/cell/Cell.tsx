import { ICellProps } from "@components/Form/components/ui/cell";
import { FormUi } from "@components/Form/components/ui";
import { useFieldName } from "../field/context";
import { useField } from "../field";
import { FormModel } from "@components/Form/internal/FormModel";

export const Cell = (props: ICellProps) => {
    const fieldName = useFieldName();
    const field = useField(fieldName);
    const {requiredLevel = FormModel.getRequiredLevelEnumFromXrm(field?.getRequiredLevel()), label = field?.getColumn().displayName} = props;

    return <FormUi.Cell {...props} requiredLevel={requiredLevel} label={label} />
}