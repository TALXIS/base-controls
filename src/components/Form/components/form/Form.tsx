import { useMemo } from "react";
import { useControlTheme } from "../../../../hooks";
import { initializeIcons, ThemeProvider } from "@fluentui/react";
import { Form as FormModel } from '../../Form';
import { FormContext } from "./context";
import { getFormStyles } from "./styles";


export interface IFormProps {
    id?: string;
    children?: React.ReactNode;
}

//TOOD: remove me
initializeIcons();

export const Form = (props: IFormProps) => {
    const id = useMemo(() => props.id ?? crypto.randomUUID(), [props.id]);
    const { children } = props;
    const form = useMemo(() => new FormModel(), []);
    const styles = useMemo(() => getFormStyles(), []);
    const theme = useControlTheme();

    return <FormContext.Provider value={form}>
        <ThemeProvider theme={theme}>
            <div className={styles.form} data-id={`form-${ud}`}>
                {children}
            </div>
        </ThemeProvider>
    </FormContext.Provider>
}