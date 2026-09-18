import { FetchXmlDataProvider, IDataProvider } from "@talxis/client-libraries";
import type { IDataverseLookupManyParameters } from "@components/TaskGrid/descriptors/dataverse/DataverseTaskGridDescriptor";
import { Liquid } from "liquidjs";

/**
 * Builds the picker provider behind one lookup-many column from the column's own `FetchXml` binding.
 *
 * The query is a Liquid template resolved per row: `{{ task.* }}` is the record the cell sits on, and
 * `{{ project.* }}` and `{{ currentRecord.* }}` are the descriptor's project and source records, reached
 * through the `modules.onGetLookupManyModule` context.
 *
 * @example
 * ```ts
 * onGetLookupManyModule: ({ services, projectRecord }) => createLookupManyModule({
 *     createDataProvider: (parameters) => DataverseLookupManyDataProviderFactory.create({
 *         ...parameters,
 *         projectRecord: context.projectRecord,
 *         sourceRecord: context.sourceRecord,
 *     }),
 * })
 * ```
 */
export class DataverseLookupManyDataProviderFactory {
    private static _liquid: Liquid = new Liquid();

    /**
     * @param parameters What the `lookupMany` module's `createDataProvider` received, plus the descriptor's project/source records.
     * @returns A provider over the column's candidate query, or `undefined` when the column carries no
     * `FetchXml` binding — the grid then reports that the column has no candidates.
     */
    public static create(parameters: IDataverseLookupManyParameters): IDataProvider | undefined {
        const { record, column, projectRecord, sourceRecord } = parameters;
        const customControl = record.getColumnInfo(column.name).ui.getCustomControls([])?.[0];
        const fetchXml = customControl?.bindings?.FetchXml?.value;
        if (!fetchXml) {
            return undefined;
        }
        return new FetchXmlDataProvider({
            fetchXml: this._liquid.parseAndRenderSync(fetchXml, {
                task: {
                    id: record.getRecordId(),
                    ...record.getRawData()
                },
                project: {
                    id: projectRecord?.getRecordId(),
                    ...projectRecord?.getRawData()
                },
                currentRecord: {
                    id: sourceRecord?.getRecordId(),
                    ...sourceRecord?.getRawData()
                }
            })
        });
    }
}
