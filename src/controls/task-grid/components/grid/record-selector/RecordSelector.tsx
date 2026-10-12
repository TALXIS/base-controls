import * as React from "react";
import { CommandBarButton, IButtonProps, Icon, Spinner, Text, useTheme } from "@fluentui/react";
import { IDataProvider, IDataProviderEventListeners, IRecord } from "@talxis/client-libraries";
import { FixedSizeList } from "react-window";
import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { useDataProvider } from "@utils";
import { DatasetControl } from "@controls/dataset-control";
import { useTaskGridLabels } from "@controls/task-grid/context";
import { getRecordSelectorStyles } from "./styles";

/** Props for {@link RecordSelector}. */
export interface IRecordSelectorProps {
    /** The records to offer, searched through the provider itself; it outlives the selector. */
    provider: IDataProvider;
    /** Called with the chosen record's id. */
    onRecordSelected: (recordId: string) => void;
    /** Wraps each record's button, for an icon or a secondary line of its own. */
    onRenderRecord?: (props: IButtonProps, defaultRender: (props: IButtonProps) => React.ReactNode) => React.ReactNode;
}

/** A searchable, virtualized single-record picker over any `IDataProvider`. */
export const RecordSelector = (props: IRecordSelectorProps) => {
    const theme = useTheme();
    const styles = React.useMemo(() => getRecordSelectorStyles(theme), []);
    const providerRef = React.useRef(props.provider);

    return <DatasetControl height='285px' className={styles.root} destroyProviderOnUnmount={false} onLoad={async () => ({ provider: providerRef.current })}>
        <DatasetControl.Header className={styles.header}>
            <DatasetControl.Header.End>
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body className={styles.body}>
            <RecordList {...props} />
        </DatasetControl.Body>
    </DatasetControl>;
};

const RecordList = (props: IRecordSelectorProps) => {
    const provider = useDataProvider();
    const labels = useTaskGridLabels();
    const theme = useTheme();
    const styles = React.useMemo(() => getRecordSelectorStyles(theme), []);
    const { rerender } = useRerender();
    const { onRenderRecord = (props, defaultRender) => defaultRender(props) } = props;
    const records = provider.getRecords();

    useEventEmitter<IDataProviderEventListeners>(provider, ['onLoading', 'onNewDataLoaded'], rerender);

    if (provider.isLoading()) {
        return <div className={styles.loadingContainer}>
            <Spinner />
        </div>;
    }
    if (records.length === 0) {
        return <div className={styles.recordsNotFoundContainer}>
            <Icon className={styles.recordsNotFoundIcon} iconName='SearchAndApps' />
            <Text>{labels.getLocalizedString('noRecordsFound')}</Text>
        </div>;
    }
    return <FixedSizeList className={styles.recordList} itemCount={records.length} itemSize={36} height={200} width={300}>
        {({ index, style }) => {
            const record: IRecord = records[index];
            return <div key={record.getRecordId()} style={style}>
                {onRenderRecord({
                    className: styles.recordButton,
                    onClick: () => props.onRecordSelected(record.getRecordId()),
                    text: record.getFormattedValue(provider.getMetadata().PrimaryNameAttribute)!
                }, props => <CommandBarButton {...props} />)}
            </div>;
        }}
    </FixedSizeList>;
};
