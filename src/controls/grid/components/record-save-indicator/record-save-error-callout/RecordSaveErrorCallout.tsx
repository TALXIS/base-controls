import { RefObject, useMemo } from "react"
import { getRecordSaveErrorCalloutStyles } from "./styles"
import { Link, Text } from "@fluentui/react";
import { IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { Callout } from "@ui";

interface IRecordSaveCalloutProps {
    /** What the callout points at. */
    target: RefObject<HTMLDivElement>;
    saveResult: IRecordSaveOperationResult;
    record: IRecord;
    onDismiss: () => void;
    onClearSaveResult: () => void;
}

export const RecordSaveErrorCallout = (props: IRecordSaveCalloutProps) => {
    const { saveResult, record, target, onDismiss, onClearSaveResult } = props;
    const styles = useMemo(() => getRecordSaveErrorCalloutStyles(), []);

    return <Callout
        className={styles.errorCallout}
        onDismiss={onDismiss}
        target={target}>
        <Text block className={styles.errorCalloutTitle} variant="xLarge">Record could not be saved</Text>
        <div className={styles.errorCalloutContent}>
            {saveResult.errors?.map((error, i) => {
                return <div key={i}>
                    {error.fieldName && <Text key={i}><strong>{record.getField(error.fieldName).getColumn().displayName}: </strong></Text>}
                    <Text>{error.message}</Text>
                </div>
            })}
        </div>
        <Link className={styles.errorCalloutDismissLink} onClick={onClearSaveResult}>Dismiss</Link>
    </Callout>
}