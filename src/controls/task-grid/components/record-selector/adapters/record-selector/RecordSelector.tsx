import { useMemo } from "react";
import type { IDataProvider } from "@talxis/client-libraries";
import { DatasetControl } from "@controls/dataset-control";
import { Labels, LocalizationProvider, useDataProviderEvents } from "@utils";
import { RecordList, RecordSelectorFrame } from "../../ui";
import { IRecordSelectorComponents } from "./components";

export interface IRecordSelectorProps {
    /** The records to offer, searched and paged through the provider itself. */
    onCreateProvider: () => IDataProvider;
    /** Called with the chosen record's id. */
    onRecordSelected: (recordId: string) => void;
    labels?: { searchPlaceholder?: string; noRecordsFound?: string };
    components?: IRecordSelectorComponents;
}

const RecordSelectorList = (props: Pick<IRecordSelectorProps, 'onRecordSelected' | 'components'>) => {
    const provider = useDataProviderEvents(['onNewDataLoaded']);
    const primaryNameAttribute = provider.getMetadata().PrimaryNameAttribute;
    const records = provider.getRecords().map(record => ({ id: record.getRecordId(), name: record.getFormattedValue(primaryNameAttribute) ?? undefined }));
    return <RecordList records={records} onRecordSelected={props.onRecordSelected} components={props.components?.list} />;
};

/** A searchable, paged, virtualized single-record picker over any provider. */
export const RecordSelector = (props: IRecordSelectorProps) => {
    const { searchPlaceholder, noRecordsFound } = props.labels ?? {};
    const labels = useMemo((): Labels => ({
        ...(searchPlaceholder && { 'quickFind.searchPlaceholder': searchPlaceholder }),
        ...(noRecordsFound && { 'emptyRecords.noRecordsFound': noRecordsFound }),
    }), [searchPlaceholder, noRecordsFound]);

    return <RecordSelectorFrame components={props.components?.frame}>
        {parts => <LocalizationProvider labels={labels}>
            <DatasetControl height='100%' onLoad={async () => ({ provider: props.onCreateProvider() })}>
                <DatasetControl.Header components={parts.header}>
                    <DatasetControl.Header.Start>
                        <DatasetControl.QuickFind components={parts.quickFind} />
                    </DatasetControl.Header.Start>
                </DatasetControl.Header>
                <DatasetControl.Body>
                    <DatasetControl.EmptyRecords>
                        <RecordSelectorList onRecordSelected={props.onRecordSelected} components={props.components} />
                    </DatasetControl.EmptyRecords>
                </DatasetControl.Body>
                <DatasetControl.Footer>
                    <DatasetControl.Footer.End>
                        <DatasetControl.Pagination />
                    </DatasetControl.Footer.End>
                </DatasetControl.Footer>
            </DatasetControl>
        </LocalizationProvider>}
    </RecordSelectorFrame>;
};
