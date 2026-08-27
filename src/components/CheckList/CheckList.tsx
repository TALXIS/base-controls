import * as React from "react";
import { Dataset, IDataProvider } from "@talxis/client-libraries";
import { DatasetControl as DatasetControlRenderer } from "@components/DatasetControl";
import { Grid } from "./components/grid";
import { LocalizationService, usePcfContext } from "@utils";
import { CheckListDatasetControl, ICheckListDatasetControl, ICheckListFieldMapping } from "./CheckListDatasetControl";
import { CHECK_LIST_LABELS, ICheckListLabels } from "./labels";

/** Props for {@link CheckList}. */
export interface ICheckListProps {
    /**
     * The collection the checklist renders. The checklist reads and writes through it but never creates
     * or destroys it — the caller owns its lifetime.
     */
    provider: IDataProvider;
    /** Which columns in the provider's data carry the label, the order and the completion state. */
    fieldMapping: ICheckListFieldMapping;
    /** Overrides for any subset of the UI strings. See {@link ICheckListLabels}. */
    labels?: Partial<ICheckListLabels>;
    /**
     * Height for the control — a fixed value such as `'600px'`, or `'100%'` to fill the element you
     * render it into. Left unset, the control is only as tall as the grid's own minimum.
     */
    height?: string;
    /** Stable id for the control. Defaults to a generated one. */
    controlId?: string;
    /** AG Grid enterprise license key, when the host has one. */
    licenseKey?: string;
    /**
     * Called with the control once mounted — the way in to the dataset, the selection and the commands.
     */
    onReady?: (datasetControl: ICheckListDatasetControl) => void;
}

/**
 * A checklist over any `IDataProvider`. A stripped-down dataset control: ribbon only, no quick find, no
 * edit columns and no pagination. Cells are editable, and each edit is saved through the provider as it
 * is made.
 *
 * Reads the PCF context off `PcfContextProvider`, so render it inside one.
 */
export const CheckList = (props: ICheckListProps) => {
    const pcfContext = usePcfContext();
    const localizationService = React.useMemo(() => new LocalizationService({ ...CHECK_LIST_LABELS, ...props.labels }), []);
    const pcfContextRef = React.useRef(pcfContext);
    pcfContextRef.current = pcfContext;
    //the provider and the props the parameters read are held per mount: the control is built once
    const providerRef = React.useRef(props.provider);
    const propsRef = React.useRef(props);
    propsRef.current = props;

    const datasetControl = React.useMemo<ICheckListDatasetControl>(() => {
        const dataset = new Dataset(providerRef.current);
        return new CheckListDatasetControl({
            dataset: dataset,
            fieldMapping: props.fieldMapping,
            localizationService: localizationService,
            controlId: props.controlId ?? `check-list-dataset-control-${crypto.randomUUID()}`,
            onGetPcfContext: () => pcfContextRef.current,
            onGetParameters: () => ({
                Grid: dataset,
                Height: {
                    raw: propsRef.current.height ?? null
                },
                EnableEditing: {
                    raw: true
                },
                EnableAutoSave: {
                    raw: true
                },
                EnableSorting: {
                    raw: false
                },
                SelectableRows: {
                    raw: 'none'
                },
                EnableFiltering: {
                    raw: false
                },
                EnableOptionSetColors: {
                    raw: true
                },
                EnableZebra: {
                    raw: false
                },
                //the caller owns the provider it passed in, so the control never destroys it
                DestroyDatasetOnUnmount: {
                    raw: false
                },
                LicenseKey: {
                    raw: propsRef.current.licenseKey ?? null
                }
            })
        });
    }, []);

    React.useEffect(() => {
        props.onReady?.(datasetControl);
    }, []);

    return <DatasetControlRenderer
        onGetDatasetControlInstance={() => datasetControl}
        onGetControlComponent={(props) => <Grid {...props} datasetControl={datasetControl} />} />
}
