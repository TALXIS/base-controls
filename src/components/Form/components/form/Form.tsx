import { useMemo } from "react";
import { IOnLoadResult } from "../../stragegies/interfaces";
import { useControlTheme, useEventEmitter } from "../../../../hooks";
import { initializeIcons, ThemeProvider } from "@fluentui/react";
import { Form as FormModel, IFormEvents } from '../../Form';
import { FormContext, RecordContext } from "./context";
import { getFormStyles } from "./styles";
import { IFormStrategy } from "../../stragegies/interfaces";
import React from "react";
import { Skeleton } from "../skeleton";
import { FormApi, IFormApi } from "../../FormApi";


export interface IFormProps {
    strategy: IFormStrategy;
    onBeforeSave?: IFormEvents['onBeforeSave'];
    onAfterSave?: IFormEvents['onAfterSave'];
    onError?: IFormEvents['onError'];
    _onFormReady?: (api: FormModel) => void;
    onFormReady?: (api: IFormApi) => void;
    children?: React.ReactNode;
}

//TOOD: remove me
initializeIcons();

export const Form = (props: IFormProps) => {
    const { strategy } = props;
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

    return <FormInternal {...props} deps={formDeps} />
}


export const FormInternal = (props: IFormProps & { deps: IOnLoadResult }) => {
    const { children, strategy, deps, onFormReady } = props;

    const form = useMemo(() => {
        const instance = new FormModel({
            strategy: strategy,
            deps: deps
        });
        return instance;
    }, []);

    const formApi = useMemo(() => {
        return new FormApi(form);
    }, [form]);

    const record = form.getRecord();
    const id = record.getRecordId();
    const styles = useMemo(() => getFormStyles(), []);
    const theme = useControlTheme();

    //propagate these props for easy React consumer access
    useEventEmitter<IFormEvents>(form.events, 'onAfterSave', props?.onAfterSave ?? (() => { }));
    useEventEmitter<IFormEvents>(form.events, 'onBeforeSave', props?.onBeforeSave ?? (() => { }));
    useEventEmitter<IFormEvents>(form.events, 'onError', (error: any, message: string) => {
        props?.onError?.(error, message);
        alert(message);
    });

    React.useEffect(() => {
        onFormReady?.(formApi);
    }, []);


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