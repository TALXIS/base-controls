import { ICellRendererParams } from "@ag-grid-community/core";
import { IGridColumn } from "../../interfaces/IGridColumn";
import { Constants, DataTypes, IColumn, ICustomColumnFormatting, IRecord } from "@talxis/client-libraries";
import { Checkbox, Shimmer, ThemeProvider } from "@fluentui/react";
import { useEffect, useMemo, useState } from "react";
import { getCellStyles, getInnerCellStyles } from "./styles";
import { CHECKBOX_COLUMN_KEY } from "../../../constants";
import { useGridInstance } from "../../hooks/useGridInstance";
import React from "react";
import { INotificationsRef, Notifications } from "./Notifications/Notifications";
import { useDebouncedCallback } from "use-debounce";
import { Commands } from "./Commands/Commands";
import { CellContent } from "./CellContent/CellContent";
import { useThemeGenerator } from "@talxis/react-components";
import { getClassNames } from "../../../../../utils/styling/getClassNames";
import { AgGridContext } from "../AgGrid/context";

export interface ICellProps extends ICellRendererParams {
    baseColumn: IGridColumn;
    editing?: boolean;
    data: IRecord;
}

interface IInternalCellProps extends ICellProps {
    cellFormatting: Required<ICustomColumnFormatting>
}


export const Cell = (props: ICellProps) => {
    const agGridContext = React.useContext(AgGridContext);
    const styles = useMemo(() => getCellStyles(), [])
    const record = props.data;
    const cellFormatting = agGridContext.getCellFormatting(props as any);
    const cellTheme = useThemeGenerator(cellFormatting.primaryColor, cellFormatting.backgroundColor, cellFormatting.textColor, cellFormatting.themeOverride);
    const grid = useGridInstance();

    const renderContent = () => {
        switch (props.baseColumn.name) {
            case CHECKBOX_COLUMN_KEY: {
                return (
                    <Checkbox
                        checked={props.node.isSelected()}
                        styles={{
                            checkbox: styles.checkbox
                        }}
                        onChange={(e, checked) => {
                            grid.selection.toggle(record, checked!);
                            agGridContext.refreshRowSelection();
                        }} />
                );
            }
            default: {
                return <InternalCell {...props} cellFormatting={cellFormatting} />
            }
        }
    }
    return <ThemeProvider className={getClassNames([styles.cellRoot, cellFormatting.className])} theme={cellTheme}>
        {renderContent()}
    </ThemeProvider>
}


export const InternalCell = (props: IInternalCellProps) => {
    const column = props.baseColumn;
    const record = props.data;
    const grid = useGridInstance();
    const columnInfo = record.getColumnInfo(column.name)
    const notifications = columnInfo.ui.getNotifications();
    const notificationRef = React.useRef<INotificationsRef>(null);
    const notificationWrapperRef = React.useRef<HTMLDivElement>(null);
    const [shouldNotificationsFillAvailableSpace, setShouldNotificationsFillAvailableSpace] = useState(false);

    const MemoizedNotifications = React.useMemo(() => {
        return React.memo(Notifications, (prevProps, nextProps) => {
            const previousIds = prevProps.notifications.map(x => x.uniqueId).join(';');
            const nextIds = nextProps.notifications.map(x => x.uniqueId).join(';');
            if (previousIds !== nextIds) {
                return false;
            }
            return true;
        });
    }, []);

    const debounceNotificationRemeasure = useDebouncedCallback(() => {
        if (notifications && notifications.length > 0) {
            notificationRef.current?.remeasureCommandBar();
        }
    }, 100)

    const shouldShowNotEditableNotification = () => {
        if (column.isEditable && !record.getColumnInfo(column.name).security.editable) {
            return true;
        }
        return false;
    }
    const getNotificationWrapperMinWidth = () => {
        let count = 0;
        if (notifications && notifications.length > 0) {
            count++
        }
        if (columnInfo?.error === true) {
            count++;
        }
        if (shouldShowNotEditableNotification()) {
            count++;
        }
        return count * 40;
    }

    const isCellBeingEdited = (): boolean => {
        return !!props.editing
    };

    const getColumnAlignment = (): Required<IColumn['alignment']> => {
        if (column.alignment) {
            return column.alignment;
        }
        switch (props.baseColumn.dataType) {
            case DataTypes.WholeNone:
            case DataTypes.Decimal:
            case DataTypes.Currency: {
                return 'right';
            }
        }
        return 'left';
    }

    const getShouldRenderNotificationsWrapper = (): boolean => {
        if (isCellBeingEdited()) {
            return false;
        }
        if (columnInfo?.error === true) {
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
        if (columnInfo.ui.isLoading()) {
            return (
                <Shimmer styles={{
                    shimmerWrapper: styles.shimmerWrapper
                }} />
            );
        }
        switch (column.name) {
            case Constants.RIBBON_BUTTONS_COLUMN_NAME: {
                return (
                    <Commands record={record} />
                )
            }
            default: {
                return (
                    <>
                        <CellContent {...props}
                            fillAllAvailableSpace={!shouldNotificationsFillAvailableSpace}
                            columnAlignment={columnAlignment}
                            columnInfo={columnInfo}
                            cellFormatting={props.cellFormatting} />
                        {shouldRenderNotificationsWrapper &&
                            renderNotifications()
                        }
                    </>
                )
            }

        }
    }

    const renderNotifications = (): JSX.Element => {
        return (
            <div ref={notificationWrapperRef} className={styles.notificationWrapper}>
                {notifications && notifications.length > 0 &&
                    <MemoizedNotifications
                        ref={notificationRef}
                        formatting={props.cellFormatting}
                        className={styles.notifications}
                        notifications={notifications}
                        onShouldNotificationsFillAvailableSpace={(value) => setShouldNotificationsFillAvailableSpace(value)}
                    />
                }
                {shouldShowNotEditableNotification() &&
                    <MemoizedNotifications notifications={[{
                        iconName: 'Uneditable',
                        notificationLevel: 'RECOMMENDATION',
                        uniqueId: column.name,
                        title: grid.labels['value-not-editable'](),
                        compact: true,
                        messages: []
                    }]}
                    formatting={props.cellFormatting} />
                }
                {columnInfo?.error === true &&
                    <MemoizedNotifications notifications={[
                        {
                            notificationLevel: 'ERROR',
                            messages: [],
                            iconName: 'Error',
                            uniqueId: column.name,
                            title: columnInfo.errorMessage,
                            compact: true
                        }
                    ]}
                    formatting={props.cellFormatting}
                     />
                }
            </div>
        );
    }

    const shouldRenderNotificationsWrapper = getShouldRenderNotificationsWrapper();
    const notificationWrapperMinWidth = getNotificationWrapperMinWidth();
    const columnAlignment = getColumnAlignment();
    const styles = useMemo(() => getInnerCellStyles(
        columnAlignment, notificationWrapperMinWidth, shouldNotificationsFillAvailableSpace, isCellBeingEdited()
    ), [notificationWrapperMinWidth, columnAlignment, shouldNotificationsFillAvailableSpace, isCellBeingEdited()]);

    debounceNotificationRemeasure();

    React.useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            debounceNotificationRemeasure();
        })
        resizeObserver.observe(props.eGridCell);
        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        return () => {
            console.log('unmount')
        }
    }, []);


    return <div className={styles.innerCellRoot} data-is-valid={!columnInfo.error}>
        {renderContent()}
    </div>
}