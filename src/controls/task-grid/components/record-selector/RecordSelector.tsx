import { ReactNode, useMemo } from "react";
import { CommandBarButton, IButtonProps, useTheme } from "@fluentui/react";
import { FixedSizeList } from "react-window";
import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import { DatasetControl } from "@controls/dataset-control";
import { getClassNames, Labels, LocalizationProvider, useDataProviderEvents } from "@utils";
import { getRecordSelectorStyles } from "./styles";

/** Props for {@link RecordSelector}. */
export interface IRecordSelectorProps {
    /** The records to offer, searched and paged through the provider itself; destroyed as the selector goes. */
    onCreateProvider: () => IDataProvider;
    /** Called with the chosen record's id. */
    onRecordSelected: (recordId: string) => void;
    /** Wraps each record's button, for an icon or a line of its own. */
    onRenderRecord?: (props: IButtonProps, defaultRender: (props: IButtonProps) => ReactNode) => ReactNode;
    labels?: { searchPlaceholder?: string; noRecordsFound?: string };
}

const RECORD_HEIGHT = 36;
const LIST_HEIGHT = 200;
const LIST_WIDTH = 300;

const RecordList = (props: Pick<IRecordSelectorProps, 'onRecordSelected' | 'onRenderRecord'>) => {
    const provider = useDataProviderEvents(['onNewDataLoaded']);
    const theme = useTheme();
    const styles = useMemo(() => getRecordSelectorStyles(theme), [theme]);
    const { onRenderRecord = (buttonProps, defaultRender) => defaultRender(buttonProps) } = props;
    const records = provider.getRecords();
    const primaryNameAttribute = provider.getMetadata().PrimaryNameAttribute;

    return <FixedSizeList className={styles.recordList} itemCount={records.length} itemSize={RECORD_HEIGHT} height={LIST_HEIGHT} width={LIST_WIDTH}>
        {({ index, style }) => {
            const record: IRecord = records[index];
            return <div key={record.getRecordId()} style={style}>
                {onRenderRecord({
                    className: styles.recordButton,
                    text: record.getFormattedValue(primaryNameAttribute) ?? undefined,
                    onClick: () => props.onRecordSelected(record.getRecordId()),
                }, buttonProps => <CommandBarButton {...buttonProps} />)}
            </div>;
        }}
    </FixedSizeList>;
};

/** A searchable, paged, virtualized single-record picker over any provider. */
export const RecordSelector = (props: IRecordSelectorProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getRecordSelectorStyles(theme), [theme]);
    const { searchPlaceholder, noRecordsFound } = props.labels ?? {};
    const labels = useMemo((): Labels => ({
        ...(searchPlaceholder && { 'quickFind.searchPlaceholder': searchPlaceholder }),
        ...(noRecordsFound && { 'emptyRecords.noRecordsFound': noRecordsFound }),
    }), [searchPlaceholder, noRecordsFound]);
    return <div className={styles.root}>
        <LocalizationProvider labels={labels}>
            <DatasetControl height='100%' onLoad={async () => ({ provider: props.onCreateProvider() })}>
                <DatasetControl.Header className={styles.header}>
                    <DatasetControl.Header.Start>
                        <DatasetControl.QuickFind
                            components={{ onRenderContainer: containerProps => <div {...containerProps} className={getClassNames([containerProps.className, styles.quickFind])} /> }} />
                    </DatasetControl.Header.Start>
                </DatasetControl.Header>
                <DatasetControl.Body>
                    <DatasetControl.EmptyRecords>
                        <RecordList onRecordSelected={props.onRecordSelected} onRenderRecord={props.onRenderRecord} />
                    </DatasetControl.EmptyRecords>
                </DatasetControl.Body>
                <DatasetControl.Footer>
                    <DatasetControl.Footer.End>
                        <DatasetControl.Pagination />
                    </DatasetControl.Footer.End>
                </DatasetControl.Footer>
            </DatasetControl>
        </LocalizationProvider>
    </div>;
};
