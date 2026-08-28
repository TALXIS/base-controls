import * as React from "react";
import { DatasetControl as DatasetControlRenderer } from "@components/DatasetControl";
import { Skeleton } from "@components/DatasetControl/skeleton";
import { Grid } from "./components/grid";
import { LocalizationService, usePcfContext } from "@utils";
import { CheckListApi, ICheckListApi } from "./CheckListApi";
import { ICheckListDatasetControl } from "./CheckListDatasetControl";
import { CheckListDatasetControlFactory, ICheckListInitializeResult } from "./CheckListDatasetControlFactory";
import { ICheckListEvents, useCheckListEvents } from "./useCheckListEvents";
import { CONTROL_COLUMN_WIDTH } from "./components/grid/constants";
import { CHECK_LIST_LABELS, ICheckListLabels } from "./labels";

/** The checklist's own shape for the loading placeholder: a checkbox, the item, a delete button. */
const SKELETON_COLUMNS = [`0 0 ${CONTROL_COLUMN_WIDTH}px`, '2 1 0', `0 0 ${CONTROL_COLUMN_WIDTH}px`];
const SKELETON_ROW_COUNT = 5;

/** Props for {@link CheckList}. */
export interface ICheckListProps extends Partial<ICheckListEvents> {
    /**
     * Returns the items, their columns and the field mapping over them. Called once, and the skeleton is
     * shown until it resolves.
     */
    onInitialize: () => Promise<ICheckListInitializeResult> | ICheckListInitializeResult;
    /** Overrides for any subset of the UI strings. See {@link ICheckListLabels}. */
    labels?: Partial<ICheckListLabels>;
    /**
     * Height for the control — a fixed value such as `'600px'`, or `'100%'` to fill the element it is
     * rendered into. Left unset, the control is as tall as its items, up to `maxVisibleRows`.
     */
    height?: string;
    /**
     * How many items the checklist grows to fit before it starts scrolling instead. Ignored when `height`
     * is set. Defaults to 15.
     */
    maxVisibleRows?: number;
    /** Height of one item's row, in pixels. Defaults to 42. */
    rowHeight?: number;
    /**
     * Whether items can be changed. Defaults to true. Off, the checklist is read-only: no new-item row,
     * no delete button, no reordering, and the completion checkbox only reports.
     */
    enableEditing?: boolean;
    /** Whether rows alternate their background. Defaults to false. */
    enableZebra?: boolean;
    /** Whether option-set values render as coloured pills. Defaults to true. */
    enableOptionSetColors?: boolean;
    /** Whether the primary column's value is a link that opens the record. Defaults to true. */
    enableNavigation?: boolean;
    /** Stable id for the control. Defaults to a generated one. */
    controlId?: string;
    /** AG Grid enterprise license key, when the host has one. */
    licenseKey?: string;
    /**
     * Called once the checklist is built. The items are still being loaded at that point, so read them
     * from `onDataChanged` rather than straight away. See {@link ICheckListApi}.
     */
    onReady?: (api: ICheckListApi) => void;
}

/**
 * A checklist over any collection of records. Items can be renamed, reordered by dragging, marked
 * finished, added and deleted, and every change is saved as it is made.
 *
 * Reads the PCF context off `PcfContextProvider`, so render it inside one.
 */
export const CheckList = (props: ICheckListProps) => {
    const pcfContext = usePcfContext();
    const localizationService = React.useMemo(() => new LocalizationService({ ...CHECK_LIST_LABELS, ...props.labels }), []);
    const pcfContextRef = React.useRef(pcfContext);
    pcfContextRef.current = pcfContext;
    //the props the parameters read are held per mount: the control is built once
    const propsRef = React.useRef(props);
    propsRef.current = props;
    const [datasetControl, setDatasetControl] = React.useState<ICheckListDatasetControl | null>(null);

    React.useEffect(() => {
        let isMounted = true;
        (async () => {
            const instance = await CheckListDatasetControlFactory.createInstance({
                onInitialize: () => propsRef.current.onInitialize(),
                localizationService: localizationService,
                controlId: props.controlId ?? `check-list-dataset-control-${crypto.randomUUID()}`,
                onGetPcfContext: () => pcfContextRef.current,
                onGetParameters: (dataset) => ({
                    Grid: dataset,
                    Height: {
                        raw: propsRef.current.height ?? null
                    },
                    MaxVisibleRows: {
                        raw: propsRef.current.maxVisibleRows ?? null
                    },
                    RowHeight: {
                        raw: propsRef.current.rowHeight ?? null
                    },
                    EnableEditing: {
                        raw: propsRef.current.enableEditing ?? true
                    },
                    EnableOptionSetColors: {
                        raw: propsRef.current.enableOptionSetColors ?? true
                    },
                    EnableZebra: {
                        raw: propsRef.current.enableZebra ?? false
                    },
                    EnableNavigation: {
                        raw: propsRef.current.enableNavigation ?? true
                    },
                    //the four below are what make this a checklist rather than a grid, so they are not
                    //the caller's to change: the order is the stack rank and sorting would fight the
                    //drag, nothing renders a filter or a selection UI, and without the auto-save an
                    //edited item silently reverts
                    EnableSorting: {
                        raw: false
                    },
                    EnableFiltering: {
                        raw: false
                    },
                    EnableAutoSave: {
                        raw: true
                    },
                    SelectableRows: {
                        raw: 'none'
                    },
                    LicenseKey: {
                        raw: propsRef.current.licenseKey ?? null
                    }
                })
            });
            //the initialize can resolve after the checklist is gone, and there is nothing to render into
            if (!isMounted) {
                return;
            }
            setDatasetControl(instance);
            props.onReady?.(new CheckListApi(instance));
        })();
        return () => {
            isMounted = false;
        };
    }, []);

    if (!datasetControl) {
        return <Skeleton
            height={props.height}
            columns={SKELETON_COLUMNS}
            rowCount={SKELETON_ROW_COUNT}
            showHeader={false}
            showFooter={false} />
    }

    return <LoadedCheckList {...props} datasetControl={datasetControl} />
}

interface ILoadedCheckListProps extends ICheckListProps {
    datasetControl: ICheckListDatasetControl;
}

/**
 * The checklist once its control exists. Separate because the events are wired with hooks, and the
 * control they need is only there after the initialize resolved.
 */
const LoadedCheckList = (props: ILoadedCheckListProps) => {
    const { datasetControl } = props;
    useCheckListEvents(props, datasetControl);

    return <DatasetControlRenderer
        onGetDatasetControlInstance={() => datasetControl}
        onGetControlComponent={(gridProps) => <Grid {...gridProps} datasetControl={datasetControl} />} />
}
