import { ICellRendererParams } from "@ag-grid-community/core";
import { Checkbox, ThemeProvider, useTheme, Shimmer, ICommandBarItemProps, ITooltipHostProps } from "@fluentui/react";
import { IRecord, Constants } from "@talxis/client-libraries";
import { useThemeGenerator, getClassNames } from "@talxis/react-components";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useControlTheme } from "../../../../utils";
import { CHECKBOX_COLUMN_KEY } from "../../constants";
import { ICellValues } from "../../grid/ag-grid/AgGridModel";
import { IGridColumn } from "../../grid/GridModel";
import { useGridInstance } from "../../grid/useGridInstance";
import { CellContent } from "./content/CellContent";
import { Notifications } from "./notifications/Notifications";
import { getCellStyles, getInnerCellStyles } from "./styles";
import { useAgGridInstance } from "../../grid/ag-grid/useAgGridInstance";

export interface ICellProps extends ICellRendererParams {
    baseColumn: IGridColumn;
    isCellEditor: boolean;
    record: IRecord;
    cellData: ICellValues
}

export const Cell = (props: ICellProps) => {
    const styles = useMemo(() => getCellStyles(), [])
    const { cellData, record, baseColumn, node } = props;
    const { customFormatting } = cellData;
    const cellTheme = useThemeGenerator(customFormatting.primaryColor, customFormatting.backgroundColor, customFormatting.textColor, customFormatting.themeOverride);
    const agGrid = useAgGridInstance();
    const grid = useGridInstance();
    const checkBoxRef = useRef<HTMLDivElement>(null);
    const cellRef = useRef<HTMLDivElement>(null);
    const recordSelectionState = agGrid.getRecordSelectionState(node);
    const isRecordSelectionDisabled = grid.isRecordSelectionDisabled(record);

    const renderContent = () => {
        switch (props.baseColumn.name) {
            case CHECKBOX_COLUMN_KEY: {
                return (
                    <div ref={checkBoxRef} className={styles.checkBoxContainer}>
                        <Checkbox
                            checked={recordSelectionState === 'checked'}
                            disabled={isRecordSelectionDisabled}
                            indeterminate={recordSelectionState === 'indeterminate'}
                            styles={{
                                checkbox: styles.checkbox
                            }} />
                    </div>
                );
            }
            default: {
                return <InternalCell {...props} />
            }
        }
    }

    const onCheckBoxClick = useCallback(e => {
        if (!isRecordSelectionDisabled) {
            e.stopPropagation();
            e.preventDefault();
            record.getDataProvider().toggleSelectedRecordId(record.getRecordId(), { clearExisting: agGrid.getGrid().getSelectionType() === 'single' });
        }
    }, []);

    const onCellClick = useCallback((e: MouseEvent) => {
        const key = grid.getCurrentlyHeldKey();
        if(record.getDataProvider().getSummarizationType() === 'grouping' && key !== 'SHIFT' && key !== 'CONTROL' && key !== 'META') {
            e.stopPropagation();
        }
    }, []);


    useEffect(() => {
        //this needs to be done like this because stopPropagation in React onClick
        //does not stop the event from propagating to the grid (cause by synthentic events)
        //https://stackoverflow.com/questions/24415631/reactjs-syntheticevent-stoppropagation-only-works-with-react-events
        if (checkBoxRef.current) {
            checkBoxRef.current.addEventListener('click', onCheckBoxClick)
        }
        cellRef.current?.addEventListener('click', onCellClick);
    }, []);

    return <ThemeProvider
        ref={cellRef}
        theme={cellTheme}
        className={getClassNames([styles.cellRoot, customFormatting.className])}>
        {renderContent()}
    </ThemeProvider>
}


export const InternalCell = (props: ICellProps) => {
    const column = props.baseColumn;
    const record = props.record;
    const node = props.node;
    const formatting = props.cellData.customFormatting;
    const grid = useGridInstance();
    const agGrid = useAgGridInstance();
    const error = props.cellData.error;
    const notifications = props.cellData.notifications;
    const errorMessage = props.cellData.errorMessage;
    const theme = useTheme();
    const applicationTheme = useControlTheme(grid.getPcfContext().fluentDesignLanguage);
    const [recordCommands, setRecordCommands] = useState(undefined);
    const expandButtonRef = useRef<HTMLButtonElement>(null);

    const shouldShowNotEditableNotification = () => {
        if (column.isEditable && !record.getColumnInfo(column.name).security.editable) {
            return true;
        }
        return false;
    }

    const getShouldRenderNotifications = (): boolean => {
        if (props.isCellEditor) {
            return false;
        }
        if (error === true) {
            return true;
        }
        if (shouldShowNotEditableNotification()) {
            return true;
        }
        if (notifications && notifications.length > 0) {
            return true;
        }
        return false;
    }

    const renderContent = (): JSX.Element => {
        if (isLoading()) {
            return (
                <Shimmer styles={{
                    shimmerWrapper: styles.shimmerWrapper,
                    root: styles.shimmerRoot
                }} />
            );
        }
        return (
            <>
                {grid.isColumnExpandable(record, column) && <button ref={expandButtonRef} onClick={() => agGrid.toggleGroup(node)}>toggle</button>}
                {(column.type !== 'action' || column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) &&
                    <CellContent {...props} recordCommands={recordCommands} />
                }
                {shouldRenderNotifications &&
                    renderNotifications()
                }
            </>
        )
    }

    const getFarNotifications = (): ICommandBarItemProps[] => {
        const result: ICommandBarItemProps[] = [];
        const tooltipProps: ITooltipHostProps = {
            tooltipProps: {
                theme: applicationTheme
            },
            calloutProps: {
                theme: applicationTheme,
            }
        }
        if (shouldShowNotEditableNotification()) {
            result.push({
                key: 'noteditable',
                text: grid.getLabels()['value-not-editable'](),
                iconOnly: true,
                disabled: true,
                tooltipHostProps: tooltipProps,
                iconProps: {
                    iconName: 'Uneditable',
                    styles: {
                        root: styles.uneditableIconRoot
                    }
                }
            })
        }
        if (error) {
            result.push({
                key: 'error',
                iconOnly: true,
                disabled: true,
                text: errorMessage,
                tooltipHostProps: tooltipProps,
                iconProps: {
                    iconName: 'Error',
                    styles: {
                        root: styles.errorIconRoot
                    }
                }
            })
        }
        return result;
    }

    const renderNotifications = (): JSX.Element => {
        return <Notifications
            formatting={formatting}
            isActionColumn={column.type === 'action'}
            columnAlignment={props.cellData.columnAlignment}
            notifications={notifications}
            farItems={getFarNotifications()} />
    }

    const isLoading = () => {
        if (props.cellData.loading) {
            return true;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME && !recordCommands) {
            return true;

        }
        return false;
    }

    const toggleExpand = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        agGrid.toggleGroup(node)
    }, []);

    const shouldRenderNotifications = getShouldRenderNotifications();
    const styles = useMemo(() => getInnerCellStyles(props.isCellEditor, theme, props.cellData.columnAlignment), [props.isCellEditor, theme, props.cellData.columnAlignment]);

    useEffect(() => {
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            (async () => {
                //@ts-ignore - typings
                setRecordCommands(await grid.dataset.retrieveRecordCommand([record.getRecordId()], grid.inlineRibbonButtonIds));
            })();
        }
    }, [grid.getRecordValue(record, column)]);

    useEffect(() => {
        if (expandButtonRef.current) {
            expandButtonRef.current.addEventListener('click', toggleExpand);
        }
    }, []);

    return <div className={styles.innerCellRoot} data-is-valid={!error}>
        {renderContent()}
    </div>
}