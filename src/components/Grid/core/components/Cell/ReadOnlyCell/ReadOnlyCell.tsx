import * as React from 'react';
import { ILinkProps, Shimmer, TextField } from '@fluentui/react';
import { Link } from '@fluentui/react';
import { Text } from '@fluentui/react';
import { getMultilineStyle, getReadOnlyCellStyles } from './styles';
import { Commands } from '../Commands/Commands';
import { Checkbox, Icon, useTheme, Image } from '@fluentui/react';
import { Attribute, Constants, DataTypes, FileAttribute, IColumn, IRecord } from '@talxis/client-libraries';
import { ReadOnlyOptionSet } from './ReadOnlyOptionSet/ReadOnlyOptionSet';
import { IGridColumn } from '../../../interfaces/IGridColumn';
import { DataType } from '../../../enums/DataType';
import { useGridInstance } from '../../../hooks/useGridInstance';
import { useSelectionController } from '../../../../selection/controllers/useSelectionController';
import { ICellRendererParams } from '@ag-grid-community/core';
import { CHECKBOX_COLUMN_KEY } from '../../../../constants';
import { useDebouncedCallback } from 'use-debounce';
import { useState } from 'react';
import { IControl } from '../../../../../../interfaces';
import ReactDOM from 'react-dom';
import { Grid } from '../../../model/Grid';
import { AgGridContext } from '../../AgGrid/AgGrid';
import { Control, IBinding } from './Component/Control';

interface ICellProps extends ICellRendererParams {
    baseColumn: IGridColumn;
    data: IRecord;
}

export const Cell = (props: ICellProps) => {
    const selection = useSelectionController();
    const column = props.baseColumn;
    const record = props.data;
    const theme = useTheme();
    const styles = React.useMemo(() => getReadOnlyCellStyles(theme), [theme]);

    if (column.name === CHECKBOX_COLUMN_KEY) {
        return <div className={styles.cellContent}>
            <Checkbox
                checked={props.node.isSelected()}
                onChange={(e, checked) => {
                    e?.stopPropagation()
                    selection.toggle(record, checked!)
                }} />
        </div>
    }


    const grid = useGridInstance();
    const notifications = record.ui.getNotifications?.(column.name);
    //TODO: only do this if editable
    const validation = record.getColumnInfo(column.name);

    const debounceNotificationRemeasure = useDebouncedCallback(() => {
        if (notifications && notifications.length > 0) {

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
    if (column.name === Constants.RIBBON_BUTTONS_COLUMN_NAME) {
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
                    <CellContent {...props} />
                    {/*                     <InternalReadOnlyCell {...props} /> */}
                </div>
            </div>
        </div>
    )
}

const CellContent = (props: ICellProps) => {
    const column = props.baseColumn;
    const grid = useGridInstance();
    const record = props.data;
    const [initialized, setIsInitialized] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const controlRef = React.useRef<Control>();
    const agGridContext = React.useContext(AgGridContext);

    if(initialized) {
        controlRef.current?.render();
    }

    const isBeingEdited = (): boolean => {
        return agGridContext.isCellBeingEdited(props.node, column.name);
    }

    const getControl = () => {
        const controls = column.controls;
        const controlForBoth = controls?.find(control => control.appliesTo === 'both');
        if (controlForBoth) {
            return controlForBoth;
        }
        if (isBeingEdited()) {
            return controls?.find(control => control.appliesTo === 'cellEditor');
        }
        return controls?.find(control => control.appliesTo === 'cellRenderer');
    }

    const getBindings = (): {[name: string]: IBinding} => {
        const bindings: {[name: string]: IBinding} = {
            'value': {
                isStatic: false,
                type: column.dataType as any,
                valueGetter: () => record.getValue(column.name),
                onNotifyOutputChanged: (value) => {
                    record.setValue(column.name, value);
                    grid.pcfContext.factory.requestRender();
                },
                metadata: {
                    attributeName: Attribute.GetNameFromAlias(column.name),
                    enitityName: (() => {
                        const entityAliasName = Attribute.GetLinkedEntityAlias(column.name);
                        if(!entityAliasName) {
                            return grid.dataset.getTargetEntityType()
                        }
                        return grid.dataset.linking.getLinkedEntities().find(x => x.alias === entityAliasName)!.name;
                    })()
                }
            }
        }
        const control = getControl()
        if(control?.bindings) {
            Object.entries(control.bindings).map(([name, binding]) => {
                bindings[name] = {
                    isStatic: true,
                    type: binding.type!,
                    valueGetter: () => binding.value,
                }
            })
        }
        return bindings;
    }

    const createControlInstance = () => {
        return new Control({
            bindings: getBindings(),
            containerElement: containerRef.current!,
            parentPcfContext: grid.pcfContext,
            callbacks: {
                onInit: () => setIsInitialized(true),
                onGetCustomControlName: () => getControl()?.name,
                onIsControlDisabled: () => !isBeingEdited(),
            },
            overrides: {
                onRender: (isCustomControl) => {
                    if(isCustomControl) {
                        return undefined;
                    }
                    return (container, controlProps) => {
                        if(isBeingEdited()) {
                            return ReactDOM.render(React.createElement(TextField), container)
                        }
                        return ReactDOM.render(React.createElement(InternalReadOnlyCell, {
                            cellProps: props,
                            controlProps: controlProps,
                            column: column,
                            record: record,
                            grid: grid,
                        }), container);
                    }
                },
                onUnmount: (isCustomControl) => {
                    //if is custom control or no custom control is about to be mounted
                    if(isCustomControl || !getControl()?.name) {
                        return undefined;
                    }
                    return (container) => {
                        ReactDOM.unmountComponentAtNode(container)
                    }
                },
                onGetProps: () => {
                    return (props) => {
                        return {
                            ...props,
                            context: {
                                ...props.context,
                                mode: Object.create(props.context.mode, {
                                    allocatedHeight: {
                                        value: 41
                                    }
                                }),
                                fluentDesignLanguage: props.context.fluentDesignLanguage ? {
                                    ...props.context.fluentDesignLanguage,
                                    tokenTheme: {
                                        ...props.context.fluentDesignLanguage.tokenTheme,
                                        inputBackground: column.name === 'text' ? record.getValue(column.name) : undefined,
                                        underlined: false,
                                    }
                                } : undefined
                            },
                            parameters: {
                                ...props.parameters,
                                AutoFocus: {
                                    raw: true
                                },
                                EnableNavigation: {
                                    raw: false
                                },
                                IsInlineNewEnabled: {
                                    raw: false
                                },
                                EnableTypeSuffix: {
                                    raw: false
                                }
                            }
                        }
                    }
                }
            }
        })
    }
    

    React.useEffect(() => {
        controlRef.current = createControlInstance();
        return () => {
            controlRef.current?.unmount();
        }
    }, []);


    return (
        <div style={{flexGrow: 1}} ref={containerRef} />
    )
}

interface IInternalCellProps {
    column: IGridColumn;
    record: IRecord;
    grid: Grid
    controlProps: IControl<any, any, any, any>;
    cellProps: ICellProps;
}

const InternalReadOnlyCell = (props: IInternalCellProps) => {
    const cellProps = props.cellProps;
    const value = props.controlProps.parameters.value.raw;
    const grid = props.grid;
    const column = props.column;
    const record = props.record;
    const formattedValue = record.getFormattedValue(column.name)
    const theme = useTheme();
    const styles = getReadOnlyCellStyles(theme);

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
        let className = styles.link;
        switch (column.dataType) {
            case DataTypes.Multiple:
            case DataTypes.SingleLineTextArea: {
                className += ` ${getMultilineStyle(cellProps.node.rowHeight!)}`
            }
        }
        return (
            <Link {...props} className={className} title={formattedValue}>
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
        let className = `${styles.text} talxis-cell-text`
        switch (column.dataType) {
            case DataTypes.Multiple:
            case DataTypes.SingleLineTextArea: {
                className += ` ${getMultilineStyle(cellProps.node.rowHeight!)}`
            }
        }
        return <Text className={className} title={formattedValue!}>{formattedValue}</Text>
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
                onClick: () => grid.openDatasetItem(value[0])
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
                    controlProps={props.controlProps}
                    defaultRender={renderText} />
            }
            return renderText();
        }
        default: {
            return renderText()
        }

    }
}