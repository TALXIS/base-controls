import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { IconButton, SpinnerSize } from "@fluentui/react";
import { IRecord, IRecordEvents, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { Spinner, useRerender } from "@legacy";
import { useEventEmitter } from "@hooks";
import { useGridService } from "@components/Grid/grid/useGridService";
import { RecordSaveErrorCallout } from "./record-save-error-callout/RecordSaveErrorCallout";
import { getRecordSaveIndicatorStyles } from "./styles";

/** How long a successful save stays on screen before the cell goes back to what it was showing. */
const SUCCESS_VISIBLE_FOR = 2000;

export interface IRecordSaveIndicatorProps {
    record: IRecord;
    /** What the cell shows while the record has nothing to report — the checkbox, where there is one. */
    children?: ReactNode;
}

/**
 * What happened to a record the grid saved: that it is saving, that it succeeded, or why it failed.
 *
 * Renders its children while there is nothing to report, so a cell that has something else to show can hand
 * that over and take the space back only when it is needed. The state lives here rather than in whatever
 * wraps it, which is what keeps it to one save result and one timer per row.
 */
export const RecordSaveIndicator = (props: IRecordSaveIndicatorProps) => {
    const { record } = props;
    const buttonId = useMemo(() => `record_save_${crypto.randomUUID()}`, []);
    //the row's own theme, because a row can carry formatting of its own that these colours have to read against
    const theme = useGridService('theming').getCellTheme(record);
    const styles = useMemo(() => getRecordSaveIndicatorStyles(theme), [theme]);
    const rerender = useRerender();
    const successTimeoutRef = useRef<NodeJS.Timeout>();
    const [saveResult, setSaveResult] = useState<IRecordSaveOperationResult | null>(null);
    const [isErrorCalloutVisible, setIsErrorCalloutVisible] = useState<boolean>(false);

    const onAfterSaved = (result: IRecordSaveOperationResult) => {
        setSaveResult(result);
        clearTimeout(successTimeoutRef.current);
        //a failure stays until it is dismissed: nobody has read it yet, and this is the only place the
        //reason for it is offered
        if (result.success) {
            successTimeoutRef.current = setTimeout(() => setSaveResult(null), SUCCESS_VISIBLE_FOR);
        }
    };

    //the spinner reads `isSaving` off the record, so a save starting is the one change that renders nothing
    //by itself - everything after it goes through `saveResult`
    useEventEmitter<IRecordEvents>(record, 'onBeforeSaved', rerender);
    useEventEmitter<IRecordEvents>(record, 'onAfterSaved', onAfterSaved);

    useEffect(() => () => clearTimeout(successTimeoutRef.current), []);

    const renderStatus = (): ReactNode => {
        if (record.isSaving()) {
            return <Spinner size={SpinnerSize.xSmall} />;
        }
        if (!saveResult) {
            return props.children;
        }
        return <>
            <IconButton
                id={buttonId}
                //only a failure has anything more to say
                onClick={() => setIsErrorCalloutVisible(!saveResult.success)}
                iconProps={{
                    iconName: saveResult.success ? 'SkypeCircleCheck' : 'StatusErrorFull',
                    //the colour is the class's; the glyph only says which of the two it is
                    className: saveResult.success ? styles.saveSuccessBtn : styles.saveErrorBtn,
                }}
            />
            {isErrorCalloutVisible &&
                <RecordSaveErrorCallout
                    record={record}
                    saveResult={saveResult}
                    targetId={buttonId}
                    onDismiss={() => setIsErrorCalloutVisible(false)}
                    onClearSaveResult={() => setSaveResult(null)} />
            }
        </>;
    };

    //a total row was never saved, so it has nothing to report and nothing to give the space back to
    if (record.getSummarizationType() === 'aggregation') {
        return <></>;
    }

    return <div className={styles.root}>
        {renderStatus()}
    </div>
};
