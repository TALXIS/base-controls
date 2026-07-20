import { NestedControlRenderer } from "../../../NestedControlRenderer";
import { useFieldContext } from "../field/context";
import { BaseControls } from "../../../../utils";



export interface IFormControlProps {

}



export const Control = (props: IFormControlProps) => {
    const field = useFieldContext();
    if (!field) throw new Error("Control must be used within a FieldContext.Provider");
    const disabled = field.isDisabled();
    const column = field.getColumn();

    const onNotifyOutputChanged = (outputs: any) => {
        field.setValue(outputs.value);
    }

    return <NestedControlRenderer
        context={{} as any}
        parameters={{
            ControlName: BaseControls.GetControlNameForDataType(column.dataType),
            ControlStates: {
                isControlDisabled: disabled
            }
        }}
        onNotifyOutputChanged={onNotifyOutputChanged}
    />
}