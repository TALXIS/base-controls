import { useMemo } from "react";
import { IOnLoadResult } from "../../../stragegies/interfaces";
import { useControlTheme, useEventEmitter } from "../../../../../hooks";
import { initializeIcons, ThemeProvider } from "@fluentui/react";
import { FormModel, IFormEvents } from '../../../internal/FormModel';
import { FormContext, RecordContext } from "./context";
import { getFormStyles } from "./styles";
import { IFormStrategy } from "../../../stragegies/interfaces";
import React from "react";
import { FormUi } from "../../ui";
import { FormApi, IFormApi } from "../../../internal/FormApi";

export interface IFormProps {
    strategy: IFormStrategy;
    onBeforeSave?: IFormEvents['onBeforeSave'];
    onAfterSave?: IFormEvents['onAfterSave'];
    onError?: IFormEvents['onError'];
    onFormReady?: (api: IFormApi) => void;
    children?: React.ReactNode;
}

initializeIcons();

export const Root = (props: IFormProps) => {
    const { strategy } = props;
    const [formDeps, setFormDeps] = React.useState<IOnLoadResult | null>(null);

    const onLoad = async () => {
        const result = await strategy.onLoad();
        setFormDeps(result);
    };

    const onRefreshRequested = async () => {
        setFormDeps(null);
        await onLoad();
    };

    React.useEffect(() => {
        onLoad();
    }, []);

    if (!formDeps) {
        return <FormUi.Skeleton />
    }

    return <RootInternal {...props} deps={formDeps} onRefreshRequested={onRefreshRequested} />
};

export const RootInternal = (props: IFormProps & { deps: IOnLoadResult, onRefreshRequested: () => void }) => {
    const { children, strategy, deps, onFormReady, onRefreshRequested } = props;

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

    useEventEmitter<IFormEvents>(form.events, 'onAfterSave', props?.onAfterSave ?? (() => { }));
    useEventEmitter<IFormEvents>(form.events, 'onBeforeSave', props?.onBeforeSave ?? (() => { }));
    useEventEmitter<IFormEvents>(form.events, 'onError', (error: any, message: string) => {
        props?.onError?.(error, message);
    });
    useEventEmitter(form.events, 'onRefreshRequested', onRefreshRequested);

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
