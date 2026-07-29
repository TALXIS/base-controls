import { ICellProps } from "../../ui/cell";
import { FormUi } from "../../ui";
import { useFieldContext } from "../field/context";
import { useField } from "../field";
import { Form } from "../../../Form";

export const Cell = (props: ICellProps) => {
    const fieldName = useFieldContext();
    const field = useField(fieldName);
    const {requiredLevel = Form.getRequiredLevelEnumFromXrm(field?.getRequiredLevel()), label = field?.getColumn().displayName} = props;

    return <FormUi.Cell {...props} requiredLevel={requiredLevel} label={label} />
}