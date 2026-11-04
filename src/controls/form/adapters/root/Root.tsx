import { useMemo } from "react";
import { IRecord } from "@talxis/client-libraries";
import { useEventEmitter, useIsMounted, useLatest } from "@core";
import { initializeIcons } from "@fluentui/react";
import { FormRuntime, IFormEvents } from '../../runtime/FormRuntime';
import { FormContext } from "./context";
import { getFormStyles } from "./styles";
import React from "react";
import { FormUi } from "../../ui";
import { FormApi } from "../../runtime/FormApi";
import { IFormAfterSaveParams, IFormProps, IValidation } from "../../interfaces";
import { applyFieldConfigs } from "./fieldConfigs";

initializeIcons();

export const Root = (props: IFormProps) => {
    const [record, setRecord] = React.useState<IRecord | null>(null);
    const propsRef = useLatest(props);
    const isMounted = useIsMounted();

    const load = async () => {
        setRecord(null);
        try {
            const result = await propsRef.current.onLoad();
            if (isMounted()) {
                setRecord(result.record);
            }
        }
        catch (error) {
            propsRef.current.onError?.(error, (error as Error)?.message ?? String(error));
        }
    };

    React.useEffect(() => {
        load();
    }, []);

    if (!record) {
        return <FormUi.Skeleton />
    }

    return <RootInternal {...props} record={record} onRefreshRequested={load} />
};

export const RootInternal = (props: IFormProps & { record: IRecord, onRefreshRequested: () => void }) => {
    const { children, onFormReady, onRefreshRequested } = props;
    const form = useMemo(() => new FormRuntime({ record: props.record }), []);

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
