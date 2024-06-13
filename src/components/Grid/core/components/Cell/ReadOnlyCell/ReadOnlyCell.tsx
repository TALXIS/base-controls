import * as React from 'react';
import { ILinkProps } from '@fluentui/react/lib/components/Link/Link.types';
import { Link } from '@fluentui/react/lib/components/Link/Link';
import { Text } from '@fluentui/react/lib/Text';
import { getReadOnlyCellStyles } from './styles';
import { Commands } from '../Commands/Commands';
import { Checkbox, Icon, TooltipHost, useTheme, Image } from '@fluentui/react';
import { FileAttribute } from '@talxis/client-libraries';
import { ReadOnlyOptionSet } from './ReadOnlyOptionSet/ReadOnlyOptionSet';
import { IGridColumn } from '../../../interfaces/IGridColumn';
import { DataType } from '../../../enums/DataType';
import { useColumnValidationController } from '../../../../validation/controllers/useRecordValidationController';
import { useGridInstance } from '../../../hooks/useGridInstance';
import { useSelectionController } from '../../../../selection/controllers/useSelectionController';
import { IEntityRecord } from '../../../../interfaces';
import { ICellRendererParams } from '@ag-grid-community/core';
import { RIBBON_COLUMN_KEY } from '../../../../constants';
import { useRerender } from '../../../hooks/useRerender';

interface ICellProps extends ICellRendererParams {
    baseColumn: IGridColumn;
    data: IEntityRecord;
    [key: string]: any;
}

export const ReadOnlyCell = (props: ICellProps) => {
    const grid = useGridInstance();
    const column = props.baseColumn;
    const record = props.data; 
    const theme = useTheme();
    const styles = getReadOnlyCellStyles(theme);
    const tooltipId = React.useMemo(() => Math.random().toString(), []);

    const [isValid, errorMessage] = useColumnValidationController({
        column: column,
        record: record,
    })

    return (
        <TooltipHost
            id={tooltipId}
            content={!isValid && !grid.loading ? errorMessage : undefined}>
            <div className={styles.root} data-is-valid={isValid}>
                <div className={styles.cellContent}>
                    <InternalReadOnlyCell {...props} />
                </div>
                {!isValid && <Icon styles={{
                    root: {
                        color: theme.semanticColors.errorIcon
                    }
                }} iconName='Error' />}
            </div>
        </TooltipHost>
    )
};

const InternalReadOnlyCell = (props: ICellProps) => {
    const [_, rerender] = useRerender();
    const grid = useGridInstance();
    const column = props.baseColumn;
    const theme = useTheme();
    const styles = getReadOnlyCellStyles(theme);
    const selection = useSelectionController();
    const record: IEntityRecord = (() => {
        //this is so we can load the updated record values from state
        const updatedRecord = grid.recordUpdateService.record(props.data.getRecordId()).get() as any;
        return updatedRecord ?? props.data;
    })();
    const formattedValue = record.getFormattedValue(column.key);

    React.useEffect(() => {
        //rerender();
    }, [record.getValue(column.key)])

    const renderLink = (props: ILinkProps, formattedValue: string): JSX.Element => {
        switch(column.dataType) {
            case DataType.LOOKUP_OWNER:
            case DataType.LOOKUP_SIMPLE: {
                if(!grid.isNavigationEnabled) {
                    return renderText();
                }
            }
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
        return <Text className={`${styles.text} talxis-cell-text`} title={formattedValue}>{formattedValue}</Text>
    }
    const downloadFile = () => {
        const storage = new FileAttribute(grid.pcfContext.webAPI);
        const namedReference = record.getNamedReference();
        storage.downloadFileFromAttribute({
            //@ts-ignore - PowerApps do not follow the typings
            entityName: namedReference.etn ?? namedReference.entityName,
            recordId: record.getRecordId(),
            fileAttribute: column.key,
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
                href: formattedValue,
                target: '_blank',
                rel: 'noopener noreferrer'
            }, formattedValue);
        }
        case DataType.LOOKUP_SIMPLE:
        case DataType.LOOKUP_OWNER: {
            return renderLink({
                onClick: () => grid.openDatasetItem(record.getValue(column.key) as any)
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
            if(grid.enableOptionSetColors) {
                return <ReadOnlyOptionSet
                column={column}
                record={record}
                defaultRender={renderText} />
            }
            return renderText();
        }
        default: {
            if(column.key === '__checkbox') {
                return <Checkbox
                checked={props.node.isSelected()}
                onChange={(e, checked) => {
                    e?.stopPropagation()
                    selection.toggle(record, checked!)
                }} />
            }
            if(column.key === RIBBON_COLUMN_KEY) {
                return <Commands record={record} />
            }
            return renderText()
        }

    }
}