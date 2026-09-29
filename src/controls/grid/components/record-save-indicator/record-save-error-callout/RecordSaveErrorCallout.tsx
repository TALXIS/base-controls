import { RefObject, useMemo } from "react"
import { DefaultButton, Icon, Text, useTheme } from "@fluentui/react";
import { IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { Callout } from "@ui";
import { useGridService } from "../../../useGridService";
import { getRecordSaveErrorCalloutStyles } from "./styles"

export interface IRecordSaveErrorCalloutProps {
    /** What the callout points at. */
    target: RefObject<HTMLDivElement>;
    saveResult: IRecordSaveOperationResult;
    record: IRecord;
    onDismiss: () => void;
    onClearSaveResult: () => void;
}

/** What a row says when the record behind it refused to save, field by field. */
export const RecordSaveErrorCallout = (props: IRecordSaveErrorCalloutProps) => {
    const { saveResult, record, target, onDismiss, onClearSaveResult } = props;
    const theme = useTheme();
    const labels = useGridService('labels');
    const columnsMap = record.getDataProvider().getColumnsMap();
    const styles = useMemo(() => getRecordSaveErrorCalloutStyles(theme), [theme]);

    return <Callout
        onDismiss={onDismiss}
        target={target}
        styles={{ calloutMain: styles.errorCallout }}>
        <div className={styles.header}>
            <Icon iconName='StatusErrorFull' className={styles.icon} />
            <Text variant='mediumPlus' className={styles.title}>{labels.getLocalizedString('recordSaveErrorTitle')}</Text>
        </div>
        <div className={styles.fields}>
            {saveResult.errors?.map((error, index) => <div key={index} className={styles.field}>
                {error.fieldName && <Text variant='medium' className={styles.fieldName}>
                    {columnsMap[error.fieldName]?.displayName ?? error.fieldName}
                </Text>}
                <Text variant='medium' className={styles.message}>{error.message}</Text>
            </div>)}
        </div>
        <div className={styles.footer}>
            <DefaultButton text={labels.getLocalizedString('recordSaveErrorDismiss')} onClick={onClearSaveResult} />
        </div>
    </Callout>
}
