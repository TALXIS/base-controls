import { Dataset, IColumn, IDataset, IRawRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { IDatasetControlParameters } from "@components/DatasetControl";
import { ILocalizationService } from "@utils";
import { CheckListDatasetControl, ICheckListDatasetControl, ICheckListFieldMapping } from "./CheckListDatasetControl";
import { ICheckListLabels } from "./labels";

/** What `ICheckListProps.onInitialize` returns. Everything in it is copied, never written to. */
export interface ICheckListInitializeResult {
    /** The items, as raw records. */
    data: IRawRecord[];
    /** Their columns. Every column the field mapping points at has to be among them. */
    columns: IColumn[];
    /** Which of those columns carry the id, the label, the order and the completion state. */
    fieldMapping: ICheckListFieldMapping;
}

interface ICheckListDatasetControlFactoryParameters {
    onInitialize: () => Promise<ICheckListInitializeResult> | ICheckListInitializeResult;
    controlId: string;
    localizationService: ILocalizationService<ICheckListLabels>;
    onGetPcfContext: () => ComponentFramework.Context<any, any>;
    /** Called with the dataset the factory built, since the parameters have to carry it. */
    onGetParameters: (dataset: IDataset) => IDatasetControlParameters;
}

/** Builds a ready-to-use {@link ICheckListDatasetControl} from whatever `onInitialize` resolves with. */
export class CheckListDatasetControlFactory {
    /**
     * Awaits the initialize, then puts the data behind a provider of the checklist's own. The caller
     * hands over rows and columns and never sees the provider — which is why the control is free to
     * destroy it on unmount.
     *
     * Stops at the control, unlike the task grid's factory, which goes on to refresh its dataset: the
     * dataset control renderer calls `init` on mount, and that is what preloads the provider and runs the
     * field mapping. Calling it here would run all of it twice.
     */
    public static async createInstance(parameters: ICheckListDatasetControlFactoryParameters): Promise<ICheckListDatasetControl> {
        const { data, columns, fieldMapping } = await parameters.onInitialize();
        const provider = new MemoryDataProvider({
            //cloned rather than referenced: the provider edits the rows it is given as the list is used,
            //and the caller's array is not the checklist's to write to
            dataSource: structuredClone(data),
            //the field mapping is every piece of metadata a checklist needs. No LogicalName: nothing here
            //opens a record or resolves a lookup, which is all an entity name would be read for
            metadata: {
                PrimaryIdAttribute: fieldMapping.id,
                PrimaryNameAttribute: fieldMapping.name
            }
        });
        //copied a level deep, metadata included: the checklist hides columns and reorders them, and the
        //grid writes widths back - all of which would otherwise land on the caller's own objects
        provider.setColumns(columns.map(column => ({
            ...column,
            metadata: column.metadata ? { ...column.metadata } : undefined
        })));
        const dataset = new Dataset(provider);
        return new CheckListDatasetControl({
            dataset: dataset,
            fieldMapping: fieldMapping,
            controlId: parameters.controlId,
            localizationService: parameters.localizationService,
            onGetPcfContext: parameters.onGetPcfContext,
            onGetParameters: () => parameters.onGetParameters(dataset)
        });
    }
}
