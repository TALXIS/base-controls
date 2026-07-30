import { useMemo } from "react";
import { IOnLoadResult } from "@components/Form/stragegies/interfaces";
import { useEventEmitter } from "@hooks";
import { initializeIcons } from "@fluentui/react";
import { FormModel, IFormEvents } from '@components/Form/internal/FormModel';
import { FormContext, FormLocalizationServiceContext } from "./context";
import { getFormStyles } from "./styles";
import { IFormStrategy } from "@components/Form/stragegies/interfaces";
import React from "react";
import { FormUi } from "@components/Form/components/ui";
import { FormApi } from "@components/Form/internal/FormApi";
import { IFormApi } from "@components/Form/interfaces";
import { FORM_LABELS, IFormLabels } from "@components/Form/labels";
import { LocalizationService } from "@utils";

export interface IFormProps {
    strategy: IFormStrategy;
    children?: React.ReactNode;
    onBeforeSave?: IFormEvents['onBeforeSave'];
    onAfterSave?: IFormEvents['onAfterSave'];
    onError?: IFormEvents['onError'];
    onFormReady?: (api: IFormApi) => void;
    labels?: Partial<IFormLabels>;
}

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

    useEventEmitter<IFormEvents>(form.events, 'onAfterSave', props?.onAfterSave ?? (() => { }));
    useEventEmitter<IFormEvents>(form.events, 'onBeforeSave', props?.onBeforeSave ?? (() => { }));
    useEventEmitter<IFormEvents>(form.events, 'onError', (error: any, message: string) => {
        props?.onError?.(error, message);
    });
    useEventEmitter(form.events, 'onRefreshRequested', onRefreshRequested);

    React.useEffect(() => {
        onFormReady?.(formApi);
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
