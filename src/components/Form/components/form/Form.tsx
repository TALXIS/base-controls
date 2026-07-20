import { useMemo } from "react";
import { useControlTheme } from "../../../../hooks";
import { initializeIcons, ThemeProvider } from "@fluentui/react";
import { Form as FormModel, IFormParams } from '../../Form';
import { FormContext, RecordContext } from "./context";
import { getFormStyles } from "./styles";


export interface IFormProps extends IFormParams {
    children?: React.ReactNode;
}

//TOOD: remove me
initializeIcons();

export const Form = (props: IFormProps) => {
    const { children, ...rest } = props;
    const form = useMemo(() => new FormModel(rest), []);
    const record = form.getRecord();
    const id = record.getRecordId();
    const styles = useMemo(() => getFormStyles(), []);
    const theme = useControlTheme();

    return <FormContext.Provider value={form}>
        <RecordContext.Provider value={record}>
            <ThemeProvider theme={theme}>
                <div className={styles.form} data-id={`form-${id}`}>
                    {children}
                </div>
            </ThemeProvider>
        </RecordContext.Provider>
    </FormContext.Provider>
}