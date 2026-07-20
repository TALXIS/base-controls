import { IColumn, IField } from "@talxis/client-libraries";
import { IBinding, NestedControlRenderer } from "../../../NestedControlRenderer";
import { useFieldContext } from "../field/context";



export interface IFormControlProps {
    id?: string;
    datafieldname?: string;
    disabled?: boolean;
    bindings?: {[key: string]: IBinding};
    column?: IColumn;
    onOutputChanged?: (outputs: any) => void;

}

export const Control = (props: IFormControlProps) => {
    const field = useFieldContext();
    const { id, datafieldname, bindings, disabled = field?.isDisabled(), onOutputChanged } = props;

    const onNotifyOutputChanged = (outputs: any) => {
        onOutputChanged?.(outputs);
        field?.setValue(outputs.value);
    }

    return <NestedControlRenderer 
        context={{} as any}
        parameters={{
        ControlName: '',
        ControlStates: {
            isControlDisabled: disabled
        }
    }}
    onNotifyOutputChanged={onNotifyOutputChanged}  
    />
}