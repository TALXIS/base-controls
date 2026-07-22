import { useMemo } from "react";
import { IOnLoadResult } from "../../stragegies/interfaces";
import { useControlTheme, useEventEmitter } from "../../../../hooks";
import { initializeIcons, ThemeProvider } from "@fluentui/react";
import { Form as FormModel } from '../../Form';
import { FormContext, RecordContext } from "./context";
import { getFormStyles } from "./styles";
import { IFormStrategy } from "../../stragegies/interfaces";
import React from "react";
import { Skeleton } from "../skeleton";
import { useRerender } from "@talxis/react-components";
import { IRecordEvents } from "@talxis/client-libraries";


export interface IFormProps {
    strategy: IFormStrategy;
    children?: React.ReactNode;
}

//TOOD: remove me
initializeIcons();

const mock = (lcid: number) => {
    window.Xrm = {
        Utility: {
            //@ts-ignore
            getGlobalContext: () => {
                return {
                    userSettings: {
                        languageId: lcid
                    }
                }
            }
        }
    }
}

export const Form = (props: IFormProps) => {
    mock(1029);
    const { strategy, children } = props;
    const [formDeps, setFormDeps] = React.useState<IOnLoadResult | null>(null);

    const onLoad = async () => {
        const result = await strategy.onLoad();
        setFormDeps(result);
    }

    React.useEffect(() => {
        onLoad();
    }, []);


    if (!formDeps) {
        return <Skeleton />
    }

    return <FormInternal deps={formDeps} strategy={strategy}>
        {children}
    </FormInternal>
}


export const FormInternal = (props: IFormProps & { deps: IOnLoadResult }) => {
    const { children, strategy, deps } = props;

    const form = useMemo(() => new FormModel({
        strategy: strategy,
        deps: deps
    }), []);

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