import { useMemo } from "react";
import { IOnLoadResult } from "@components/Form/stragegies/interfaces";
import { useEventEmitter } from "@hooks";
import { initializeIcons } from "@fluentui/react";
import { FormModel, IFormEvents } from '@components/Form/internal/FormModel';
import { FormContext, FormLocalizationServiceContext } from "./context";
import { getFormStyles } from "./styles";
import React from "react";
import { FormUi } from "@components/Form/components/ui";
import { FormApi } from "@components/Form/internal/FormApi";
import { IFormAfterSaveParams, IFormProps, IValidation } from "@components/Form/interfaces";
import { FORM_LABELS } from "@components/Form/labels";
import { LocalizationService } from "@utils";

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
    const localizationService = useMemo(() => {
        return new LocalizationService({
            ...FORM_LABELS,
            ...props.labels,
        });
    }, []);

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

    return (
        <FormLocalizationServiceContext.Provider value={localizationService}>
            <FormContext.Provider value={form}>
                <div className={styles.form} data-id={`form-${id}`}>
                    {children}
                </div>
            </FormContext.Provider>
        </FormLocalizationServiceContext.Provider>
    )
}
