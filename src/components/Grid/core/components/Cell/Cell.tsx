import { ICellRendererParams } from "@ag-grid-community/core";
import { IGridColumn } from "../../interfaces/IGridColumn";
import { Constants, IRecord, MemoryCache } from "@talxis/client-libraries";
import { useSelectionController } from "../../../selection/controllers/useSelectionController";
import { Checkbox, ITheme, Shimmer, ThemeProvider } from "@fluentui/react";
import { useMemo } from "react";
import { getCellStyles } from "./styles";
import { CHECKBOX_COLUMN_KEY } from "../../../constants";
import { useGridInstance } from "../../hooks/useGridInstance";
import React from "react";
import { INotificationsRef, Notifications } from "./Notifications/Notifications";
import { useDebouncedCallback } from "use-debounce";
import { Commands } from "./Commands/Commands";
import { AgGridContext } from "../AgGrid/AgGrid";
import { useThemeGenerator } from "@talxis/react-components";
import { useCachedThemeGenerator } from "./useCachedThemeGenerator";

interface ICellProps extends ICellRendererParams {
    baseColumn: IGridColumn;
    data: IRecord;
}

const ThemeCache = new MemoryCache();

export const Cell = (props: ICellProps) => {
    const agGridContext = React.useContext(AgGridContext);
    const selection = useSelectionController();
    const column = props.baseColumn;
    const record = props.data;
    const customFormatting = agGridContext.getCellFormatting(props as any);
    const theme = useCachedThemeGenerator(customFormatting.primaryColor, customFormatting.backgroundColor, customFormatting.textColor);
    const styles = useMemo(() => getCellStyles(), []);
    const grid = useGridInstance();
    const notifications = record.ui.getNotifications?.('text');
    const notificationRef = React.useRef<INotificationsRef>(null);
    const override: ITheme = {
        fonts: {
            medium: {
                fontWeight: 600
            }
        }
    }
    const validation = record.getColumnInfo('text');

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
    }, 10);

    const shouldShowNotEditableNotification = (): boolean => {
        if (column.isEditable && !record.getColumnInfo('text').security.editable) {
            return true;
        }
        return false;
    }

    const calculateNotificationsWrapperMinWidth = (): number => {
        let count = 0;
        if (notifications && notifications.length > 0) {
            count++
        }
        if (validation?.error === true) {
            count++;
        }
        if (shouldShowNotEditableNotification()) {
            count++;
        }
        return count * 40;
    }

    const shouldRenderNotificationsWrapper = (): boolean => {
        if (isCellBeingEdited()) {
            return false;
        }
        if (validation?.error === true) {
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

    const isCellBeingEdited = (): boolean => {
        return agGridContext.isCellBeingEdited(props.node, 'text');
    }

    const renderContent = (): JSX.Element => {
        if (record.ui?.isLoading('text')) {
            return (
                <Shimmer styles={{
                    shimmerWrapper: styles.shimmerWrapper
                }} />
            );
        }
        switch (column.name) {
            case CHECKBOX_COLUMN_KEY: {
                return (
                    <Checkbox
                        checked={props.node.isSelected()}
                        onChange={(e, checked) => {
                            e?.stopPropagation()
                            selection.toggle(record, checked!)
                        }} />
                );
            }
            case Constants.RIBBON_BUTTONS_COLUMN_NAME: {
                return (
                    <Commands record={record} />
                )
            }
            default: {
                return (
                    <>
                        <div className={styles.cellContent}>dynamic cell content</div>
                        {shouldRenderNotificationsWrapper() &&
                            renderNotifications()
                        }
                    </>
                )
            }

        }
    }

    const renderNotifications = (): JSX.Element => {
        return (
            <div className={styles.notifications}>
                {notifications && notifications.length > 0 &&
                    <MemoizedNotifications ref={notificationRef} notifications={notifications} />
                }
                {validation?.error === true &&
                    <MemoizedNotifications notifications={[
                        {
                            notificationLevel: 'ERROR',
                            messages: [],
                            iconName: 'Error',
                            uniqueId: column.name,
                            title: validation.errorMessage,
                            compact: true
                        }
                    ]} />
                }
                {shouldShowNotEditableNotification() &&
                    <MemoizedNotifications notifications={[{
                        iconName: 'Uneditable',
                        notificationLevel: 'RECOMMENDATION',
                        uniqueId: column.name,
                        title: grid.labels['value-not-editable'](),
                        compact: true,
                        messages: []
                    }]} />
                }
            </div>
        );
    }
    debounceNotificationRemeasure();

    React.useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            debounceNotificationRemeasure();
        })
        resizeObserver.observe(props.eGridCell);
    }, []);

    return <ThemeProvider className={styles.cellWrapper} theme={theme}>
        {renderContent()}
    </ThemeProvider>
}