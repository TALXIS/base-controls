import { ICellRendererParams } from "@ag-grid-community/core";
import { Checkbox, ThemeProvider, useTheme, Shimmer, ICommandBarItemProps, ITooltipHostProps, IconButton, mergeStyles, Icon, SpinnerSize, CommandBarButton, TooltipHost, MessageBar, MessageBarType, mergeStyleSets } from "@fluentui/react";
import { IRecord, Constants, DataProvider } from "@talxis/client-libraries";
import { useThemeGenerator, getClassNames, useRerender, Spinner } from "@talxis/react-components";
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
import ReactDOM from "react-dom";
import { GridContext } from "../../grid/GridContext";
import { AgGridContext } from "../../grid/ag-grid/AgGridContext";
import { CheckmarkCircle24Filled, ErrorCircle24Filled } from '@fluentui/react-icons';

export interface ICellProps extends ICellRendererParams {
    baseColumn: IGridColumn;
    isCellEditor: boolean;
    record: IRecord;
    value: ICellValues;
}

const SELECTION_MODIFIER_KEYS = ['SHIFT', 'CONTROL', 'META'];

export const Cell = (props: ICellProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const memoizedContainerRef = useRef<HTMLDivElement | null>();
    const { record, node, baseColumn } = props;
    const column = baseColumn;
    const grid = useGridInstance();
    const agGrid = useAgGridInstance();
    const rerender = useRerender();

    const skipCellRendering = (() => {
        const dataProvider = record.getDataProvider();
        const summarizationType = dataProvider.getSummarizationType();
        switch (true) {
            case column.type === 'action': {
                return false;
            }
            case props.value.loading: {
                return false;
            }
            case summarizationType === 'grouping': {
                const _column = dataProvider.getColumnsMap()[column.name]!;
                if (_column.aggregation?.aggregationFunction && !_column.grouping?.isGrouped) {
                    return false;
                }
                return dataProvider.grouping.getGroupBys()[0].columnName !== column.name
            }
            case summarizationType === 'aggregation': {
                return !dataProvider.getColumnsMap()[column.name]?.aggregation?.aggregationFunction;
            }
            case summarizationType === 'none': {
                return !!column.grouping?.isGrouped
            }
            default: {
                return false;
            }
        }
    })();

    const onCellClick = useCallback((e: MouseEvent) => {
        const key = grid.getCurrentlyHeldKey();
        if (record.getDataProvider().getSummarizationType() === 'grouping' && !SELECTION_MODIFIER_KEYS.includes(key!)) {
            e.stopPropagation();
        }
        else if (node.isSelected()) {
            e.stopPropagation();
        }
    }, []);

    const onFieldValueChanged = useCallback(async (columnName: string) => {
        if (columnName !== column.name) {
            return;
        }
        props.api.refreshCells({
            rowNodes: [node]
        })
        setTimeout(() => {
            rerender();
        }, 0);
    }, []);


    const getTopLevelCellWrapperStyles = () => {
        return mergeStyleSets({
            cellRoot: {
                width: '100%',
                height: (() => {
                    if (skipCellRendering && column.autoHeight) {
                        return `${grid.getDefaultRowHeight()}px !important`;
                    }
                    return '100% !important';
                })()
            }
        })
    }

    useEffect(() => {
        memoizedContainerRef.current = containerRef.current;
        containerRef.current?.addEventListener('click', onCellClick);
        record.addEventListener('onFieldValueChanged', onFieldValueChanged)
        return () => {
            containerRef.current?.removeEventListener('click', onCellClick);
            record.removeEventListener('onFieldValueChanged', onFieldValueChanged);
            ReactDOM.unmountComponentAtNode(memoizedContainerRef.current!);
        }
    }, []);


    useEffect(() => {
        if (skipCellRendering) {
            return;
        }
        ReactDOM.render(
            <GridContext.Provider value={grid}>
                <AgGridContext.Provider value={agGrid}>
                    <CellContentWrapper {...props} />
                </AgGridContext.Provider>
            </GridContext.Provider>,
            containerRef.current
        );
    });
    return <div className={getTopLevelCellWrapperStyles().cellRoot} ref={containerRef} />
}

const CellContentWrapper = (props: ICellProps) => {
    const { value: cellData, record, baseColumn, node } = props;
    const { customFormatting } = cellData;
    const cellTheme = useThemeGenerator(customFormatting.primaryColor, customFormatting.backgroundColor, customFormatting.textColor, customFormatting.themeOverride);
    const styles = useMemo(() => getCellStyles(cellTheme), [cellTheme])
    const agGrid = useAgGridInstance();
    const grid = useGridInstance();
    const checkBoxRef = useRef<HTMLDivElement>(null);
    const cellRef = useRef<HTMLDivElement>(null);
    const recordSelectionState = agGrid.getRecordSelectionState(node);
    const isRecordSelectionDisabled = grid.isRecordSelectionDisabled(record);
    const [savingResult, setSavingResult] = useState<'success' | 'error' | null>(null);
    const rerender = useRerender();

    const onCheckBoxClick = useCallback(e => {
        if (!isRecordSelectionDisabled) {
            e.stopPropagation();
            e.preventDefault();
            record.getDataProvider().toggleSelectedRecordId(record.getRecordId(), { clearExisting: agGrid.getGrid().getSelectionType() === 'single' });
        }
    }, []);


    const renderContent = () => {
        if (baseColumn.name === CHECKBOX_COLUMN_KEY && record.getDataProvider().getSummarizationType() !== 'aggregation') {
            if (record.isSaving()) {
                return <Spinner size={SpinnerSize.xSmall} />
            }
            if (savingResult) {
                return (
                    <IconButton
                        styles={{
                            root: styles.autoSaveBtnRoot,
                        }}
                        title={savingResult === 'success' ? grid.getLabels()['saving-autosave-success']() : grid.getLabels()['saving-autosave-error']()}
                        onRenderIcon={() => {
                            if (savingResult === 'success') {
                                return <CheckmarkCircle24Filled className={styles.autoSaveBtnSuccess} />
                            }
                            else {
                                return <ErrorCircle24Filled className={styles.autoSafeBtnError} />
                            }
                        }}
                    />
                )
            }
            if (grid.getSelectionType() !== 'none') {
                return (
                    <div
                        ref={checkBoxRef}
                        className={styles.checkBoxContainer}>
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
        }
        else {
            return <InternalCell {...props} />
        }
    }

    const onAfterSaved = useCallback((result) => {
        if (result) {
            setSavingResult('success');
            setTimeout(() => {
                setSavingResult(null);
            }, 5000);
        }
        else {
            setSavingResult('error');
        }
    }, []);


    useEffect(() => {
        record.addEventListener('onAfterSaved', onAfterSaved);
        record.addEventListener('onBeforeSaved', rerender)
        //this needs to be done like this because stopPropagation in React onClick
        //does not stop the event from propagating to the grid (cause by synthentic events)
        //https://stackoverflow.com/questions/24415631/reactjs-syntheticevent-stoppropagation-only-works-with-react-events
        if (checkBoxRef.current) {
            checkBoxRef.current.addEventListener('click', onCheckBoxClick)
        }
        return () => {
            record.removeEventListener('onAfterSaved', onAfterSaved);
            record.removeEventListener('onBeforeSaved', rerender);
        }
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
    const formatting = props.value.customFormatting;
    const grid = useGridInstance();
    const agGrid = useAgGridInstance();
    const error = props.value.error;
    const notifications = props.value.notifications;
    const errorMessage = props.value.errorMessage;
    const theme = useTheme();
    const applicationTheme = useControlTheme(grid.getPcfContext().fluentDesignLanguage);
    const [recordCommands, setRecordCommands] = useState(undefined);
    const rerender = useRerender();
    const styles = useMemo(() => getInnerCellStyles(
        props.isCellEditor,
        theme,
        props.value.columnAlignment,
        node.expanded
    ), [props.isCellEditor, theme, props.value.columnAlignment, node.expanded]);

    const shouldShowNotEditableNotification = () => {
        if (column.isEditable && !record.getColumnInfo(column.name).security.editable && record.getSummarizationType() === 'none') {
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
                {grid.isColumnExpandable(record, column) &&
                    <IconButton
                        iconProps={{ iconName: 'ChevronRight' }}
                        styles={{
                            root: styles.groupToggleButtonRoot,
                            icon: styles.groupToggleButtonIcon
                        }}
                        onClick={() => {
                            agGrid.toggleGroup(node);
                            rerender();
                        }} />
                }
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
            columnAlignment={props.value.columnAlignment}
            notifications={notifications}
            farItems={getFarNotifications()} />
    }

    const isLoading = () => {
        if (props.value.loading) {
            return true;
        }
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME && !recordCommands) {
            return true;
        }
        return false;
    }

    const shouldRenderNotifications = getShouldRenderNotifications();

    useEffect(() => {
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            (async () => {
                //@ts-ignore - typings
                setRecordCommands(await grid.dataset.retrieveRecordCommand([record.getRecordId()], grid.inlineRibbonButtonIds));
            })();
        }
    }, [grid.getRecordValue(record, column).value]);

    return <div
        className={styles.innerCellRoot}
        data-is-loading={isLoading()}
        data-is-valid={!error}>
        {renderContent()}
    </div>
}