import * as React from 'react';
import { ILinkProps, Shimmer } from '@fluentui/react';
import { Link } from '@fluentui/react';
import { Text } from '@fluentui/react';
import { getReadOnlyCellStyles } from './styles';
import { Commands } from '../Commands/Commands';
import { Checkbox, Icon, useTheme, Image } from '@fluentui/react';
import { Constants, FileAttribute, IRecord } from '@talxis/client-libraries';
import { ReadOnlyOptionSet } from './ReadOnlyOptionSet/ReadOnlyOptionSet';
import { IGridColumn } from '../../../interfaces/IGridColumn';
import { DataType } from '../../../enums/DataType';
import { useGridInstance } from '../../../hooks/useGridInstance';
import { useSelectionController } from '../../../../selection/controllers/useSelectionController';
import { ICellRendererParams } from '@ag-grid-community/core';
import { CHECKBOX_COLUMN_KEY } from '../../../../constants';
import { INotificationsRef, Notifications } from './Notifications/Notifications';
import { useDebouncedCallback } from 'use-debounce';

interface ICellProps extends ICellRendererParams {
    baseColumn: IGridColumn;
    data: IRecord;
    [key: string]: any;
}

export const ReadOnlyCell = (props: ICellProps) => {
    const selection = useSelectionController();
    const column = props.baseColumn;
    const record = props.data;
    const theme = useTheme();
    const styles = React.useMemo(() => getReadOnlyCellStyles(theme), [theme]);

    if(column.name === CHECKBOX_COLUMN_KEY) {
        return <div className={styles.cellContent}>
        <Checkbox
            checked={props.node.isSelected()}
            onChange={(e, checked) => {
                e?.stopPropagation()
                selection.toggle(record, checked!)
            }} />
    </div>
    }
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
    
    const grid = useGridInstance();
    const notifications = record.ui.getNotifications?.(column.name);
    const notificationRef = React.useRef<INotificationsRef>(null);
    //TODO: only do this if editable
    const validation = record.getColumnInfo(column.name);

    const debounceNotificationRemeasure = useDebouncedCallback(() => {
        if (notifications && notifications.length > 0) {
            notificationRef.current?.remeasureCommandBar();
        }
    }, 10)

    debounceNotificationRemeasure();

    const shouldShowNotEditableNotification = (): boolean => {
        if (column.isEditable && !record.getColumnInfo(column.name).security.editable) {
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

    React.useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            debounceNotificationRemeasure();
        })
        resizeObserver.observe(props.eGridCell);
    }, []);


    if (record.ui?.isLoading(column.name)) {
        return <Shimmer className={styles.loading} />
    }
    if(column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
        return <div className={styles.cellContent}>
        <Commands record={record} />
    </div>
    }
    return (
        <div style={{
            '--test': `${calculateNotificationsWrapperMinWidth()}px`
        } as React.CSSProperties} className={styles.root} data-is-valid={!validation || validation.error === false}>
            <div className={styles.cellContentWrapper}>
                <div className={styles.cellContent}>
                    <InternalReadOnlyCell {...props} />
                </div>
            </div>
            {shouldRenderNotificationsWrapper() &&
                <div className={styles.notificationsWrapper}>
                    {notifications && notifications.length > 0 &&
                        <MemoizedNotifications className={styles.notifications} ref={notificationRef} notifications={notifications} />
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
                    {
                        shouldShowNotEditableNotification() &&
                        <MemoizedNotifications className={styles.uneditableNotification} notifications={[{
                            iconName: 'Uneditable',
                            notificationLevel: 'RECOMMENDATION',
                            uniqueId: column.name,
                            title: grid.labels['value-not-editable'](),
                            compact: true,
                            messages: []
                        }]} />
                    }
                </div>
            }
        </div>
    )
};

const InternalReadOnlyCell = (props: ICellProps) => {
    const grid = useGridInstance();
    const column = props.baseColumn;
    const theme = useTheme();
    const styles = getReadOnlyCellStyles(theme);
    const record = props.data;
    const formattedValue = record.getFormattedValue(column.name);

    const renderLink = (props: ILinkProps, formattedValue: string | null): JSX.Element => {
        switch (column.dataType) {
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_SIMPLE:
            case DataType.LOOKUP_CUSTOMER: {
                if (!grid.isNavigationEnabled) {
                    return renderText();
                }
            }
        }
        if (!formattedValue) {
            return <></>
        }
        return (
            <Link {...props} className={styles.link} title={formattedValue}>
                {formattedValue}
            </Link>
        );
    };
    const renderText = (): JSX.Element => {
        if (column.isPrimary && grid.isNavigationEnabled) {
            return renderLink({
                onClick: () => grid.openDatasetItem(record.getNamedReference())
            }, formattedValue);
        }
        return <Text className={`${styles.text} talxis-cell-text`} title={formattedValue!}>{formattedValue}</Text>
    }
    const downloadFile = () => {
        const storage = new FileAttribute(grid.pcfContext.webAPI);
        const namedReference = record.getNamedReference();
        storage.downloadFileFromAttribute({
            //@ts-ignore - PowerApps do not follow the typings
            entityName: namedReference.etn ?? namedReference.entityName,
            recordId: record.getRecordId(),
            fileAttribute: column.name,
        }, true)
    }

    switch (column.dataType) {
        case DataType.SINGLE_LINE_EMAIL: {
            return renderLink({ href: `mailto:${formattedValue}` }, formattedValue);
        }
        case DataType.SINGLE_LINE_PHONE: {
            return renderLink({ href: `tel:${formattedValue}` }, formattedValue);
        }
        case DataType.SINGLE_LINE_URL: {
            return renderLink({
                href: formattedValue ?? "",
                target: '_blank',
                rel: 'noopener noreferrer'
            }, formattedValue);
        }
        case DataType.LOOKUP_SIMPLE:
        case DataType.LOOKUP_OWNER:
        case DataType.LOOKUP_CUSTOMER: {
            return renderLink({
                onClick: () => grid.openDatasetItem(record.getValue(column.name)[0])
            }, formattedValue);
        }
        case DataType.FILE: {
            if (!formattedValue) {
                return <></>
            }
            return (
                <div className={styles.fileWrapper}>
                    <Icon iconName='Attach' />
                    {
                        renderLink({
                            onClick: downloadFile
                        }, grid.labels.download())
                    }
                </div>
            )
        }
        case DataType.IMAGE: {
            if (!formattedValue) {
                return <></>
            }
            return (
                <div className={styles.fileWrapper}>
                    <Image className={styles.image} src={`data:image/png;base64,${formattedValue}`} />
                    {
                        renderLink({
                            onClick: downloadFile
                        }, 'Download')
                    }
                </div>
            )
        }
        case DataType.OPTIONSET:
        case DataType.MULTI_SELECT_OPTIONSET:
        case DataType.TWO_OPTIONS: {
            if (grid.enableOptionSetColors) {
                return <ReadOnlyOptionSet
                    column={column}
                    record={record}
                    defaultRender={renderText} />
            }
            return renderText();
        }
        default: {
            return renderText()
        }

    }
}