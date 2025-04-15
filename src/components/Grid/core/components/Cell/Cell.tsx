import { ICellRendererParams } from "@ag-grid-community/core";
import { IGridColumn } from "../../interfaces/IGridColumn";
import { Constants, IRecord } from "@talxis/client-libraries";
import { Checkbox, ITooltipHostProps, Shimmer, ThemeProvider, useTheme } from "@fluentui/react";
import { useContext, useMemo } from "react";
import { getCellStyles, getInnerCellStyles } from "./styles";
import { CHECKBOX_COLUMN_KEY } from "../../../constants";
import { useGridInstance } from "../../hooks/useGridInstance";
import React from "react";
import { Notifications } from "./Notifications/Notifications";
import { Commands } from "./Commands/Commands";
import { CellContent } from "./CellContent/CellContent";
import { AgGridContext } from "../AgGrid/context";
import { ICellValues } from "../AgGrid/model/AgGrid";
import { getClassNames, ICommandBarItemProps, useThemeGenerator } from "@talxis/react-components";
import { useControlTheme } from "../../../../../utils";

export interface ICellProps extends ICellRendererParams {
    baseColumn: IGridColumn;
    isCellEditor: boolean;
    data: IRecord;
    value: ICellValues;
}
export const Cell = (props: ICellProps) => {
    const record = props.data;
    const styles = useMemo(() => getCellStyles(), [])
    const cellFormatting = props.value.customFormatting;
    const cellTheme = useThemeGenerator(cellFormatting.primaryColor, cellFormatting.backgroundColor, cellFormatting.textColor, cellFormatting.themeOverride);
    const grid = useGridInstance();
    const agGridContext = useContext(AgGridContext);

    const renderContent = () => {
        switch (props.baseColumn.name) {
            case CHECKBOX_COLUMN_KEY: {
                return (
                    <Checkbox
                        checked={props.node.isSelected()}
                        onChange={(e, checked) => {
                            grid.selection.toggle(props.node.id!);
                        }}
                        styles={{
                            checkbox: styles.checkbox
                        }} />
                );
            }
            default: {
                if(!record) {
                    return <span></span>
                }
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
    const theme = useTheme();
    const applicationTheme = useControlTheme(grid.pcfContext.fluentDesignLanguage);

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
        if (isLoading) {
            return (
                <Shimmer styles={{
                    shimmerWrapper: styles.shimmerWrapper,
                    root: styles.shimmerRoot
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
                        {column.type !== 'action' &&
                            <CellContent {...props} />
                        }
                        {shouldRenderNotifications &&
                            renderNotifications()
                        }
                    </>
                )
            }

        }
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
                text: grid.labels['value-not-editable'](),
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

    const shouldRenderNotifications = getShouldRenderNotifications();
    const styles = useMemo(() => getInnerCellStyles(props.isCellEditor, theme, props.value.columnAlignment), [props.isCellEditor, theme, props.value.columnAlignment]);


    return <div className={styles.innerCellRoot} data-is-valid={!error}>
        {renderContent()}
    </div>
}