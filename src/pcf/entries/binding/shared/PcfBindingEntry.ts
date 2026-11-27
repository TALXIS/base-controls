import { ComponentType, createElement } from 'react';
import ReactDOM from 'react-dom';
import type { DeepPartial, IRawRecord } from '@talxis/client-libraries';
import type { IDatasetControl, IDatasetControlViewControl, IDatasetControlViewGroup } from '@controls/dataset-control';
import type { IDatasetControlViewColumn } from '@controls/dataset-control/runtime/interfaces';
import { getDefinedLabelKeys, Labels } from '@labels';
import { createThemeBuilder } from '@theme';
import type { IIsolatedComponentProps } from '@controls/isolated-frame';
import type { IPcfBindingFrameProps, PcfBindingFrameContextPropName } from './PcfBindingFrame';
import { PcfBindingTranslations } from './PcfBindingTranslations';
import { getPcfBindingEntryStyles } from './styles';

type StringProperty = ComponentFramework.PropertyTypes.StringProperty;
type TwoOptionsProperty = ComponentFramework.PropertyTypes.TwoOptionsProperty;

/** The inputs both binding entries read. */
export interface IPcfBindingEntryInputs {
    /** JSON entity metadata, set on the provider. */
    EntityMetadata?: StringProperty;
    /** JSON `PcfBindingTranslationDictionary`, which `{{t 'key'}}` in the bindings is looked up in. */
    Translations?: StringProperty;
    Height?: StringProperty;
    ClientApiWebResourceName?: StringProperty;
    /** Called with `IPcfBindingScriptParameters` on every mount, before the data loads. */
    ClientApiFunctionName?: StringProperty;
    EnablePagination?: TwoOptionsProperty;
    EnablePageSizeSwitcher?: TwoOptionsProperty;
}

export interface IPcfBindingView<TData = unknown> {
    id: string;
    name: string;
    group?: IDatasetControlViewGroup;
    /** A fetchXml for the FetchXml provider, records for the Memory provider. */
    dataSource: string | IRawRecord[];
    /** Laid by name over the layout's or the fetchXml's columns; the rest are appended. */
    columns?: IDatasetControlViewColumn[];
    /** What the PCF's body reads through `getView().data`. */
    data?: TData;
    /** What the PCF's body reads through `getView().control`. */
    control?: IDatasetControlViewControl;
}

export interface IPcfBindingConfig<TData = unknown> {
    views?: IPcfBindingView<TData>[];
    metadata?: DeepPartial<Xrm.Metadata.EntityMetadata>;
}

/** What the client API function is called with. */
export interface IPcfBindingScriptParameters<TConfig = IPcfBindingConfig, TData = unknown> {
    /** The runtime being mounted; it has no provider or view until it is ready. */
    datasetControl: IDatasetControl<TData>;
    controlId?: string;
    /** The bindings on the first mount, the config last set on later ones. */
    config: TConfig;
    /** The control waits until this is called, on every mount. */
    setConfig: (config: TConfig) => void;
}

type CommonContext = ComponentFramework.Context<IPcfBindingEntryInputs>;

export const prepareContainer = (container: HTMLDivElement): void => {
    container.classList.add(getPcfBindingEntryStyles().container);
};

/** @param props What the entry decides; the rest is read from the context. */
export const renderFrame = <TProps extends IPcfBindingFrameProps>(container: HTMLDivElement, frame: ComponentType<TProps & IIsolatedComponentProps>, context: CommonContext, props: Omit<TProps, PcfBindingFrameContextPropName>): void => {
    const height = getHeight(context);
    const frameProps = {
        ...props,
        context,
        theme: createThemeBuilder().getTheme(),
        height,
        frame: { height, title: 'Dataset control', className: height === '100%' ? getPcfBindingEntryStyles().frame : undefined },
    } as TProps & IIsolatedComponentProps;
    ReactDOM.render(createElement(frame, frameProps), container);
};

export const getMetadata = (context: CommonContext): IPcfBindingConfig['metadata'] => {
    const { EntityMetadata } = context.parameters;
    return EntityMetadata?.raw ? JSON.parse(EntityMetadata.raw) : undefined;
};

/** Hands the config to the client API function and waits for the one it sets, when the PCF names a function. */
export const runConfigScript = async <TConfig, TData>(context: CommonContext, datasetControl: IDatasetControl<TData>, config: TConfig): Promise<TConfig> => {
    const functionName = context.parameters.ClientApiFunctionName?.raw;
    if (!functionName) {
        return config;
    }
    let onConfigSet!: (config: TConfig) => void;
    const configSet = new Promise<TConfig>(resolve => onConfigSet = resolve);
    const parameters: IPcfBindingScriptParameters<TConfig, TData> = {
        datasetControl,
        //@ts-ignore - typings
        controlId: context.utils._customControlProperties?.controlId,
        config,
        setConfig: newConfig => onConfigSet(newConfig),
    };
    //@ts-ignore - typings
    await Xrm.Utility.executeFunction(getWebResourceName(context), functionName, [parameters]);
    return await configSet;
};

export const getTranslations = (context: CommonContext): PcfBindingTranslations => {
    const { Translations } = context.parameters;
    return new PcfBindingTranslations({
        dictionary: Translations?.raw ? JSON.parse(Translations.raw) : {},
        languageId: context.userSettings.languageId,
    });
};

//Power Apps picks the resx of the user's language; a key it lacks keeps its English default
export const getLabels = (context: CommonContext): Labels => {
    const entries = getDefinedLabelKeys().map(key => [key, context.resources.getString(key)] as const);
    return Object.fromEntries(entries.filter(([key, value]) => value && value !== key));
};

export const isPartEnabled = (property?: TwoOptionsProperty): boolean => property?.raw ?? true;

const getHeight = (context: CommonContext): string | undefined => context.parameters.Height?.raw?.trim() || undefined;

const getWebResourceName = (context: CommonContext): string => {
    const name = context.parameters.ClientApiWebResourceName?.raw;
    if (!name) {
        throw new Error('The "ClientApiWebResourceName" parameter is required when "ClientApiFunctionName" is set.');
    }
    return name;
};
