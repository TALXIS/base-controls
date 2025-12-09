import { useMemo } from "react"
import { getRecordSaveErrorCalloutStyles } from "./styles"
import { Callout, Link, Text, ThemeProvider } from "@fluentui/react";
import { IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { useControlTheme } from "../../../../../utils";
import { useGridInstance } from "../../../grid/useGridInstance";

interface IRecordSaveCalloutProps {
    targetId: string;
    saveResult: IRecordSaveOperationResult;
    record: IRecord;
    onDismiss: () => void;
    onClearSaveResult: () => void;
}

export const RecordSaveErrorCallout = (props: IRecordSaveCalloutProps) => {
    const { saveResult, record, targetId, onDismiss, onClearSaveResult } = props;
    const styles = useMemo(() => getRecordSaveErrorCalloutStyles(), []);
    const grid = useGridInstance();
    const theme = useControlTheme(grid.getPcfContext().fluentDesignLanguage);

    return <Callout
        className={styles.errorCallout}
        theme={theme}
        onDismiss={onDismiss}
        target={`#${targetId}`}>
        <Text block className={styles.errorCalloutTitle} variant="xLarge">Record could not be saved</Text>
        <ThemeProvider theme={theme} className={styles.errorCalloutContent}>
            {saveResult.errors?.map((error, i) => {
                return <div key={i}>
                    {error.fieldName && <Text key={i}><strong>{record.getField(error.fieldName).getColumn().displayName}: </strong></Text>}
                    <Text>{error.message}</Text>
                </div>
            })}
        </ThemeProvider>
        <Link className={styles.errorCalloutDismissLink} onClick={onClearSaveResult}>Dismiss</Link>
    </Callout>
}