import { IField } from "@talxis/client-libraries";
import { getControlStyles } from "./styles";
import { useEffect, useMemo } from "react";
import { MessageBar, MessageBarType } from "@fluentui/react";
import { useForm } from "../root/context";
import { useField } from "../field";
import { useDisabledContext } from "@components/Form/components/ui/cell";
import { ControlComponents, IControlComponents } from "./components";
import { ControlComponentContext, useControlComponents } from "./context";

export interface IControlProps {
    id?: string;
    disabled?: boolean;
    components?: Partial<IControlComponents>;
}

const BoundControl = (props: IControlProps & { field: IField }) => {
    const { field, ...rest } = props;
    const form = useForm();
    const components = useControlComponents();
    const validationResult = form.saveOperationPerformed ? field.isValid() : null;
    const styles = useMemo(() => getControlStyles(), []);


    return <div className={styles.control}>
        {components.onRenderControl(rest)}
        {validationResult?.error &&
            <MessageBar messageBarType={MessageBarType.error}>
                {validationResult.errorMessage}
            </MessageBar>
        }
    </div>
}

export const Control = (props: IControlProps) => {
    const { disabled = false } = props;
    const field = useField();
    const disabledContext = useDisabledContext();
    const components = {...ControlComponents, ...props.components};

    useEffect(() => {
        disabledContext?.onDisabledChange(disabled);
    }, [disabled, disabledContext?.onDisabledChange]);

    if (!field) {
        return <MessageBar messageBarType={MessageBarType.error}>
            Unbound controls are currently not supported.
        </MessageBar>
    }
    return <ControlComponentContext.Provider value={components}>
        <BoundControl {...props} field={field} />
    </ControlComponentContext.Provider>
}