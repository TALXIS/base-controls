import { ICellRendererParams } from "@ag-grid-community/core";
import { IGridColumn } from "../../interfaces/IGridColumn";
import { Constants, IRecord } from "@talxis/client-libraries";
import { Checkbox, Shimmer, ThemeProvider } from "@fluentui/react";
import { useMemo, useRef, useState } from "react";
import { getCellStyles, getInnerCellStyles } from "./styles";
import { CHECKBOX_COLUMN_KEY } from "../../../constants";
import { useGridInstance } from "../../hooks/useGridInstance";
import React from "react";
import { INotificationsRef, Notifications } from "./Notifications/Notifications";
import { Commands } from "./Commands/Commands";
import { CellContent } from "./CellContent/CellContent";
import { AgGridContext } from "../AgGrid/context";
import { ICellValues } from "../AgGrid/model/AgGrid";
import { getClassNames, useResizeObserver, useThemeGenerator } from "@talxis/react-components";

export interface ICellProps extends ICellRendererParams {
    baseColumn: IGridColumn;
    editing: boolean;
    data: IRecord;
    value: ICellValues
}
export const Cell = (props: ICellProps) => {
    const agGridContext = React.useContext(AgGridContext);
    const record = props.data;
    const styles = useMemo(() => getCellStyles(), [])
    const cellFormatting = props.value.customFormatting;
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
                return <InternalCell {...props} />
            }
        }
    }

    return <ThemeProvider theme={cellTheme} className={getClassNames([styles.cellRoot, cellFormatting.className])}>
        {renderContent()}
    </ThemeProvider>
}


export const InternalCell = (props: ICellProps) => {
    const column = props.baseColumn;
    const record = props.data;
    const formatting = props.value.customFormatting;
    const grid = useGridInstance();
    const error = props.value.error;
    const notifications = props.value.notifications;
    const isLoading = props.value.loading;
    const errorMessage = props.value.errorMessage;
    const notificationRef = React.useRef<INotificationsRef>(null);
    const notificationWrapperRef = React.useRef<HTMLDivElement>(null);
    const isGridObservedRef = useRef(false);
    const [shouldNotificationsFillAvailableSpace, setShouldNotificationsFillAvailableSpace] = useState(false);

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
        if (error === true) {
            count++;
        }
        if (shouldShowNotEditableNotification()) {
            count++;
        }
        return count * 40;
    }

    const getShouldRenderNotificationsWrapper = (): boolean => {
        if (props.editing) {
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
        if (isLoading) {
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
                            fillAllAvailableSpace={!shouldNotificationsFillAvailableSpace} />
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
                    <Notifications
                        ref={notificationRef}
                        formatting={formatting}
                        className={styles.notifications}
                        notifications={notifications}
                        onShouldNotificationsFillAvailableSpace={(value) => setShouldNotificationsFillAvailableSpace(value)}
                    />
                }
                {shouldShowNotEditableNotification() &&
                    <Notifications notifications={[{
                        iconName: 'Uneditable',
                        notificationLevel: 'RECOMMENDATION',
                        uniqueId: column.name,
                        title: grid.labels['value-not-editable'](),
                        compact: true,
                        messages: []
                    }]}
                    formatting={formatting} />
                }
                {error &&
                    <Notifications notifications={[
                        {
                            notificationLevel: 'ERROR',
                            messages: [],
                            iconName: 'Error',
                            uniqueId: column.name,
                            title: errorMessage,
                            compact: true
                        }
                    ]}
                    formatting={formatting}
                     />
                }
            </div>
        );
    }

    const shouldRenderNotificationsWrapper = getShouldRenderNotificationsWrapper();
    const notificationWrapperMinWidth = getNotificationWrapperMinWidth();
    const styles = useMemo(() => getInnerCellStyles(
        props.value.columnAlignment, notificationWrapperMinWidth, shouldNotificationsFillAvailableSpace, props.editing
    ), [notificationWrapperMinWidth, props.value.columnAlignment, shouldNotificationsFillAvailableSpace, props.editing]);

    const observeCell = useResizeObserver(() => {
        if (notifications && notifications.length > 0) {
            notificationRef.current?.remeasureCommandBar();
        }
    });

    React.useEffect(() => {
        if(notifications.length > 0 && !isGridObservedRef.current) {
            observeCell(props.eGridCell);
            isGridObservedRef.current = true;
        }
    }, [notifications]);


    return <div className={styles.innerCellRoot} data-is-valid={!error}>
        {renderContent()}
    </div>
}