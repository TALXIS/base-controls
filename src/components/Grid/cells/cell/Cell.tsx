import { ICellRendererParams } from "@ag-grid-community/core";
import { ThemeProvider, useTheme, Shimmer, ICommandBarItemProps, ITooltipHostProps, IconButton, mergeStyleSets } from "@fluentui/react";
import { IRecord, Constants, DataProvider, IControlParameters, ICustomColumnControl, IRecordEvents, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { useThemeGenerator, useRerender } from "@legacy";
import { getClassNames , usePcfContext} from "@utils";
import { useMemo, useEffect, useRef, useCallback } from "react";
import { useControlTheme } from "@utils";
import { ICellValues } from "@components/Grid/grid/cells";
import { IGridColumn } from "@components/Grid/grid/columns";
import { useGridService } from '@components/Grid/grid/useGridService';
import { CellContent } from "./content/CellContent";
import { Notifications } from "./notifications/Notifications";
import { getCellStyles, getInnerCellStyles } from "./styles";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { CellErrorBoundary } from "@components/error-boundary";

export interface ICellProps extends ICellRendererParams {
    baseColumn: IGridColumn;
    isCellEditor: boolean;
    record: IRecord;
    value: ICellValues;
    /** Which control renders the value, worked out where `isCellEditor` is known. */
    customControl: Required<ICustomColumnControl>;
    /** What that control renders with. */
    parameters: IControlParameters;
}

export const Cell = (props: ICellProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { record, node, baseColumn } = props;
    const column = baseColumn;
    const settings = useGridService('settings');
    const grouping = useGridService('grouping');
    const lastLoadingRefValue = useRef<boolean>(props.value.loading);
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
                if (lastLoadingRefValue.current && !props.value.loading) {
                    return false;
                }
                const _column = dataProvider.getColumnsMap()[column.name]!;
                if (_column.aggregation?.aggregationFunction && !_column.grouping?.isGrouped) {
                    return false;
                }
                if (grouping?.getType() === 'nested') {
                    return dataProvider.grouping.getGroupBys()[0].columnName !== column.name
                }
                return !column.grouping?.isGrouped;
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
    lastLoadingRefValue.current = props.value.loading;


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


    //two variants in practice, and this runs per cell: the group/aggregation row in an auto-height column
    //needs a fixed height, everything else fills the row
    const topLevelCellWrapperStyles = useMemo(() => mergeStyleSets({
        cellRoot: {
            width: '100%',
            height: skipCellRendering && column.autoHeight
                ? `${settings.getDefaultRowHeight()}px !important`
                : '100% !important'
        }
    }), [skipCellRendering, column.autoHeight]);
    useEventEmitter<IRecordEvents>(record, 'onFieldValueChanged', onFieldValueChanged);


    return <div className={topLevelCellWrapperStyles.cellRoot} ref={containerRef}>
        {!skipCellRendering &&
            <CellErrorBoundary>
                <CellContentWrapper {...props} />
            </CellErrorBoundary>
        }
    </div>
}

const CellContentWrapper = (props: ICellProps) => {
    const { value: cellData, record } = props;
    const { customFormatting } = cellData;
    const cellTheme = useThemeGenerator(customFormatting.primaryColor, customFormatting.backgroundColor, customFormatting.textColor, customFormatting.themeOverride);
    const styles = useMemo(() => getCellStyles(cellTheme), [cellTheme])
    const cellRef = useRef<HTMLDivElement>(null);
    const rerender = useRerender();
    useEventEmitter<IRecordEvents>(record, 'onBeforeSaved', rerender);

    return <ThemeProvider
        ref={cellRef}
        theme={cellTheme}
        className={getClassNames([styles.cellRoot, customFormatting.className])}>
        <InternalCell {...props} />
    </ThemeProvider>
}


export const InternalCell = (props: ICellProps) => {
    const column = props.baseColumn;
    const record = props.record;
    const node = props.node;
    const formatting = props.value.customFormatting;
    const grouping = useGridService('grouping');
    const labels = useGridService('labels');
    const errorRef = useRef<boolean>(props.value.error);
    const notifications = props.value.notifications;
    const errorMessageRef = useRef<string | undefined>(props.value.errorMessage);
    const theme = useTheme();
    const applicationTheme = useControlTheme(usePcfContext().fluentDesignLanguage);
    const rerender = useRerender();
    const styles = useMemo(() => getInnerCellStyles(
        props.isCellEditor,
        theme,
        props.value.columnAlignment,
        node.expanded
    ), [props.isCellEditor, theme, props.value.columnAlignment, node.expanded]);

    const isColumnExpandable = !!grouping?.isColumnExpandable(record, column);

    //the chevron is drawn from the node, so it has to hear about the node changing: expansion is also set
    //from the group header and by AG Grid itself, neither of which goes through this component
    useEffect(() => {
        if (!isColumnExpandable) {
            return;
        }
        node.addEventListener('expandedChanged', rerender);
        return () => node.removeEventListener('expandedChanged', rerender);
    }, [isColumnExpandable]);

    useEventEmitter<IRecordEvents>(record, 'onAfterSaved', (result: IRecordSaveOperationResult) => {
        if (!result.success) {
            const errors = result.errors ?? [];
            const fieldError = errors.find(error => error.fieldName === column.name);
            if (fieldError) {
                errorRef.current = true;
                errorMessageRef.current = fieldError.message;
                rerender();
            }
        }
    });

    useEventEmitter<IRecordEvents>(record, 'onFieldValueChanged', (fieldName: string) => {
        if (fieldName === column.name) {
            errorRef.current = record.getField(fieldName).isValid().error;
            rerender();
        }
    });

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
        if (errorRef.current === true) {
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
                {isColumnExpandable &&
                    <IconButton
                        iconProps={{ iconName: 'ChevronRight' }}
                        styles={{
                            root: styles.groupToggleButtonRoot,
                            icon: styles.groupToggleButtonIcon
                        }}
                        onClick={() => grouping!.toggleGroup(node)} />
                }
                {(column.type !== 'action' || column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) &&
                    <CellContent {...props} />
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
                text: labels.getLocalizedString('valueNotEditable'),
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
        if (errorRef.current) {
            result.push({
                key: 'error',
                iconOnly: true,
                disabled: true,
                text: errorMessageRef.current,
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
        return false;
    }
    const shouldRenderNotifications = getShouldRenderNotifications();

    return <div
        className={styles.innerCellRoot}
        data-is-loading={isLoading()}
        data-is-valid={!errorRef.current}>
        {renderContent()}
    </div>
}