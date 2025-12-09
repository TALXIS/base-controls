import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SelectionCellModel } from "./SelectionCellModel";
import { ICellRendererParams } from "@ag-grid-community/core";
import { IRecord, IRecordEvents, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { Spinner, useRerender } from "@talxis/react-components";
import { Callout, Checkbox, IconButton, Link, SpinnerSize, Text, ThemeProvider, useTheme } from "@fluentui/react";
import { useEventEmitter } from "../../../../hooks";
import { CheckmarkCircle24Filled, ErrorCircle24Filled } from "@fluentui/react-icons";
import { getSelectionCellStyles } from "./styles";
import { useAgGridInstance } from "../../grid/ag-grid/useAgGridInstance";
import { useGridInstance } from "../../grid/useGridInstance";
import { RecordSaveErrorCallout } from "./record-save-error-callout/RecordSaveErrorCallout";

interface ISelectionCellProps extends ICellRendererParams {
    record: IRecord;
}

export const SelectionCell = (props: ISelectionCellProps) => {
    const { record } = props;
    const saveResultButtonId = useMemo(() => `selection_result_${crypto.randomUUID()}`, []);
    const grid = useGridInstance();
    const agGrid = useAgGridInstance();
    const checkBoxRef = useRef<HTMLDivElement>(null);
    const recordSelectionState = agGrid.getRecordSelectionState(props.node);
    const isRecordSelectionDisabled = grid.isRecordSelectionDisabled(record);
    const theme = grid.getDefaultCellTheme(record);
    const styles = useMemo(() => getSelectionCellStyles(theme), []);
    const rerender = useRerender();
    const [saveResult, setSaveResult] = useState<IRecordSaveOperationResult | null>(null);
    const [isRecordSaveErrorCalloutVisible, setIsRecordSaveErrorCalloutVisible] = useState<boolean>(false);

    const onAfterSaved = (result: IRecordSaveOperationResult) => {
        setSaveResult(result);
        if (result.success) {
            setTimeout(() => setSaveResult(null), 2000);
        }
    }

    const onCheckBoxClick = useCallback(e => {
        e.stopPropagation();
        e.preventDefault();
        if (!isRecordSelectionDisabled) {
            record.getDataProvider().toggleSelectedRecordId(record.getRecordId(), { clearExisting: agGrid.getGrid().getSelectionType() === 'single' });
        }
    }, []);

    useEffect(() => {
        //this needs to be done like this because stopPropagation in React onClick
        //does not stop the event from propagating to the grid (cause by synthentic events)
        //https://stackoverflow.com/questions/24415631/reactjs-syntheticevent-stoppropagation-only-works-with-react-events
        if (checkBoxRef.current) {
            checkBoxRef.current.addEventListener('click', onCheckBoxClick)
        }
        return () => {
            checkBoxRef.current?.removeEventListener('click', onCheckBoxClick);
        }
    }, [saveResult]);

    useEventEmitter<IRecordEvents>(record, ['onBeforeSaved', 'onAfterSaved'], rerender);
    useEventEmitter<IRecordEvents>(record, 'onAfterSaved', onAfterSaved);

    return <ThemeProvider theme={theme} className={styles.selectionCellRoot}>
        {(() => {
            if(record.getSummarizationType() === 'aggregation') {
                return <></>
            }
            if (record.isSaving()) {
                return <Spinner size={SpinnerSize.xSmall} />
            }
            else if (saveResult) {
                return (
                    <>
                        <IconButton
                            id={saveResultButtonId}
                            onClick={() => setIsRecordSaveErrorCalloutVisible(!saveResult.success)}
                            onRenderIcon={() => {
                                if (saveResult?.success) {
                                    return <CheckmarkCircle24Filled className={styles.saveSuccessBtn} />
                                }
                                else {
                                    return <ErrorCircle24Filled className={styles.saveErrorBtn} />
                                }
                            }}
                        />
                        {isRecordSaveErrorCalloutVisible &&
                            <RecordSaveErrorCallout
                                record={record}
                                saveResult={saveResult}
                                targetId={saveResultButtonId}
                                onDismiss={() => setIsRecordSaveErrorCalloutVisible(false)}
                                onClearSaveResult={() => setSaveResult(null)} />
                        }
                    </>
                )
            }
            else if (grid.getSelectionType() !== 'none') {
                return (
                    <div
                        ref={checkBoxRef}
                        className={styles.checkBoxContainer}>
                        <Checkbox
                            checked={recordSelectionState === 'checked'}
                            disabled={isRecordSelectionDisabled}
                            indeterminate={recordSelectionState === 'indeterminate'}
                            styles={{
                                checkbox: styles.checkBox
                            }} />
                    </div>
                )
            }
        })()}
    </ThemeProvider>
}