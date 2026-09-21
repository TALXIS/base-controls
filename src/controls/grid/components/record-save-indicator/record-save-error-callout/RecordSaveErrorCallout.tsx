import { RefObject, useMemo } from "react"
import { DefaultButton, Icon, Text, useTheme } from "@fluentui/react";
import { IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { Callout } from "@ui";
import { getRecordSaveErrorCalloutStyles } from "./styles"

interface IRecordSaveCalloutProps {
    /** What the callout points at. */
    target: RefObject<HTMLDivElement>;
    saveResult: IRecordSaveOperationResult;
    record: IRecord;
    onDismiss: () => void;
    onClearSaveResult: () => void;
}

/** What a row says when the record behind it refused to save, field by field. */
export const RecordSaveErrorCallout = (props: IRecordSaveCalloutProps) => {
    const { saveResult, record, target, onDismiss, onClearSaveResult } = props;
    const theme = useTheme();
    const styles = useMemo(() => getRecordSaveErrorCalloutStyles(theme), [theme]);

    return <Callout
        onDismiss={onDismiss}
        target={target}
        styles={{ calloutMain: styles.errorCallout }}>
        <div className={styles.header}>
            <Icon iconName='StatusErrorFull' className={styles.icon} />
            <Text variant='mediumPlus' className={styles.title}>Your changes were not saved</Text>
        </div>
        <div className={styles.fields}>
            {saveResult.errors?.map((error, index) => <div key={index} className={styles.field}>
                {error.fieldName && <Text variant='medium' className={styles.fieldName}>
                    {record.getField(error.fieldName).getColumn().displayName}
                </Text>}
                <Text variant='medium' className={styles.message}>{error.message}</Text>
            </div>)}
        </div>
        <div className={styles.footer}>
            <DefaultButton text='Dismiss' onClick={onClearSaveResult} />
        </div>
    </Callout>
}
