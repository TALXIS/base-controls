import { useMemo, useRef, useState } from "react";
import { IconButton, SpinnerSize } from "@fluentui/react";
import { IRecord } from "@talxis/client-libraries";
import { Spinner } from "@legacy";
import { useGridService } from "@components/Grid/grid/useGridService";
import { IRecordSaveStatus } from "./useRecordSaveStatus";
import { RecordSaveErrorCallout } from "./record-save-error-callout/RecordSaveErrorCallout";
import { getRecordSaveIndicatorStyles } from "./styles";

export interface IRecordSaveIndicatorProps {
    record: IRecord;
    status: IRecordSaveStatus;
}

/** What happened to a record the grid saved: that it is saving, that it succeeded, or why it failed. */
export const RecordSaveIndicator = (props: IRecordSaveIndicatorProps) => {
    const { record, status } = props;
    const rootRef = useRef<HTMLDivElement>(null);
    const theme = useGridService('theming').getCellTheme(record);
    const styles = useMemo(() => getRecordSaveIndicatorStyles(theme), [theme]);
    const [isErrorCalloutVisible, setIsErrorCalloutVisible] = useState<boolean>(false);
    const saveResult = status.saveResult;

    if (status.isSaving) {
        return <div className={styles.root}>
            <Spinner size={SpinnerSize.xSmall} />
        </div>;
    }
    if (!saveResult) {
        return <></>;
    }
    return <div ref={rootRef} className={styles.root}>
        <IconButton
            //only a failure has anything more to say
            onClick={() => setIsErrorCalloutVisible(!saveResult.success)}
            iconProps={{
                iconName: saveResult.success ? 'SkypeCircleCheck' : 'StatusErrorFull',
                className: saveResult.success ? styles.saveSuccessBtn : styles.saveErrorBtn,
            }}
        />
        {isErrorCalloutVisible &&
            <RecordSaveErrorCallout
                record={record}
                saveResult={saveResult}
                target={rootRef}
                onDismiss={() => setIsErrorCalloutVisible(false)}
                onClearSaveResult={status.clearSaveResult} />
        }
    </div>
};
