import { useMemo } from "react";
import { IOnLoadResult } from "../../runtime/strategies/interfaces";
import { useEventEmitter, useIsMounted } from "@core";
import { initializeIcons } from "@fluentui/react";
import { FormModel, IFormEvents } from '../../runtime/FormModel';
import { FormContext } from "./context";
import { getFormStyles } from "./styles";
import React from "react";
import { FormUi } from "../../ui";
import { FormApi } from "../../runtime/FormApi";
import { IFormAfterSaveParams, IFormProps, IValidation } from "../../interfaces";
import { applyFieldConfigs } from "./fieldConfigs";

initializeIcons();

export const Root = (props: IFormProps) => {
    const { strategy } = props;
    const [formDeps, setFormDeps] = React.useState<IOnLoadResult | null>(null);
    const isMounted = useIsMounted();

    const onLoad = async () => {
        setFormDeps(null);
        const result = await strategy.onLoad();
        if (!isMounted()) return;
        setFormDeps(result);
    };

    const onRefreshRequested = async () => {
        await onLoad();
    };

    React.useEffect(() => {
        onLoad();
    }, [strategy]);

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

    useEventEmitter<IFormEvents>(form.events, 'onAfterSave', (params: IFormAfterSaveParams) => props.onAfterSave?.(params));
    useEventEmitter<IFormEvents>(form.events, 'onBeforeSave', () => props.onBeforeSave?.());
    useEventEmitter<IFormEvents>(form.events, 'onDirtyStateChanged', (isDirty: boolean) => props.onDirtyStateChanged?.(isDirty));
    useEventEmitter<IFormEvents>(form.events, 'onError', (error: any, message: string) => props.onError?.(error, message));
    useEventEmitter<IFormEvents>(form.events, 'onFieldValueChanged', (fieldName: string, newValue: any) => props.onFieldValueChanged?.(fieldName, newValue));
    useEventEmitter(form.events, 'onRefreshRequested', onRefreshRequested);
    useEventEmitter<IFormEvents>(form.events, 'onValidationSummaryChanged', (validationSummary: IValidation[]) => props.onValidationSummaryChanged?.(validationSummary));

    React.useEffect(() => {
        onFormReady?.(formApi);
        return () => {
            form.destroy();
        };
    }, []);

    React.useEffect(() => {
        applyFieldConfigs(form, children);
    }, [children]);

    return (
        <FormContext.Provider value={form}>
            <div className={styles.form} data-id={`form-${id}`}>
                {children}
            </div>
        </FormContext.Provider>
    )
}
