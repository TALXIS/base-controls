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

export interface ICellProps extends ICellRendererParams {
    baseColumn: IGridColumn;
    isCellEditor: boolean;
    isFirstGroupedColumn?: boolean;
    data: IRecord;
    value: ICellValues;
}

export const Cell = (props: ICellProps) => {
    if(!props.value) {
        return <></>
    }
    return <CellWrapper {...props} />
}

const CellWrapper = (props: ICellProps) => {
    const styles = useMemo(() => getCellStyles(), [])
    const cellFormatting = props.value.customFormatting;
    const cellTheme = useThemeGenerator(cellFormatting.primaryColor, cellFormatting.backgroundColor, cellFormatting.textColor, cellFormatting.themeOverride);
    const grid = useGridInstance();
    const selection = grid.getSelection();
    const record = props.data;
    const column = props.baseColumn;
    const node = props.node;
    const checkBoxRef = useRef<HTMLDivElement>(null);

    const shouldRenderEmptyCell = () => {
        if (record.getDataProvider().getSummarizationType() === 'aggregation') {
            if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME || column.name === CHECKBOX_COLUMN_KEY) {
                return true;
            }
        }
        return false;
    }

    const renderContent = () => {
        if (shouldRenderEmptyCell()) {
            return <></>
        }
        switch (props.baseColumn.name) {
            case CHECKBOX_COLUMN_KEY: {
                return (
                    <div ref={checkBoxRef} className={styles.checkBoxContainer}>
                        <Checkbox
                            checked={node.isSelected()}
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
        e.stopPropagation();
        e.preventDefault();
        selection.toggle(record.getRecordId());
    }, []);

    useEffect(() => {
        //this needs to be done like this because stopPropagation in React onClick
        //does not stop the event from propagating to the grid (cause by synthentic events)
        //https://stackoverflow.com/questions/24415631/reactjs-syntheticevent-stoppropagation-only-works-with-react-events
        if (checkBoxRef.current) {
            checkBoxRef.current.addEventListener('click', onCheckBoxClick)
        }
    }, []);

    return <ThemeProvider theme={cellTheme} className={getClassNames([styles.cellRoot, cellFormatting.className])}>
        {renderContent()}
    </ThemeProvider>
}


export const InternalCell = (props: ICellProps) => {
    const column = props.baseColumn;
    const record = props.data;
    const node = props.node;
    const formatting = props.value.customFormatting;
    const grid = useGridInstance();
    const error = props.value.error;
    const notifications = props.value.notifications;
    const errorMessage = props.value.errorMessage;
    const theme = useTheme();
    const applicationTheme = useControlTheme(grid.getPcfContext().fluentDesignLanguage);
    const [recordCommands, setRecordCommands] = useState(undefined);

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
                {grid.isColumnExpandable(record, column) && <button onClick={() => node.setExpanded(!node.expanded)}>toggle</button>}
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
    const styles = useMemo(() => getInnerCellStyles(props.isCellEditor, theme, props.value.columnAlignment), [props.isCellEditor, theme, props.value.columnAlignment]);

    useEffect(() => {
        if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
            (async () => {
                //@ts-ignore - typings
                setRecordCommands(await grid.dataset.retrieveRecordCommand([record.getRecordId()], grid.inlineRibbonButtonIds));
            })();
        }
    }, [grid.getRecordValue(record, column)]);

    return <div className={styles.innerCellRoot} data-is-valid={!error}>
        {renderContent()}
    </div>
}