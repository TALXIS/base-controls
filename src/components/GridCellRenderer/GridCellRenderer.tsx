import { Icon, ILinkProps, Image, ITextProps, Link, ThemeProvider } from "@fluentui/react";
import { useControl } from "../../hooks";
import { Text as FluentText } from '@fluentui/react';
import { useMemo } from "react";
import { getDefaultContentRendererStyles, getGridCellLabelStyles } from "./styles";
import { DataType, DataTypes, FileAttribute, IRecord } from "@talxis/client-libraries";
import { OptionSet } from './OptionSet';
import { IGridCellRenderer } from "./interfaces";
import { getDefaultGridRendererTranslations } from "./translations";

export const GridCellLabel = (props: IGridCellRenderer) => {
    const dataset = props.parameters.Dataset;
    const record: IRecord = props.parameters.Record;
    const column = props.parameters.Column;
    const { theme, labels } = useControl('GridCellLabel', props, getDefaultGridRendererTranslations());
    const styles = useMemo(() => getGridCellLabelStyles(props.parameters.ColumnAlignment.raw), []);
    const dataType: DataType = props.parameters.value.type as DataType;
    const value: string = props.parameters.value.raw ?? '';
    const formattedValue: string = props.parameters.value.formatted || value;
    const isNavigationEnabled = props.parameters.EnableNavigation.raw
    const onOverrideComponentProps = props.onOverrideComponentProps ?? ((props) => props);

    const getLinkProps = (): ILinkProps => {
        const props: ILinkProps = {
            title: formattedValue,
            className: styles.link
        }
        switch (dataType) {
            case DataTypes.SingleLineEmail: {
                props.href = `mailto:${value}`;
                break;
            }
            case DataTypes.SingleLinePhone: {
                props.href = `tel:${value}`;
                break;
            }
            case DataTypes.SingleLineUrl: {
                props.href = value;
                props.target = '_blank';
                break;
            }
            case DataTypes.Image:
            case DataTypes.File: {
                props.onClick = () => downloadFile();
                break;
            }
            //primary navigation link
            default: {
                props.onClick = () => {
                    dataset.openDatasetItem(record.getNamedReference());
                }
            }
        }
        return { ...props, ...componentProps.linkProps }
    }

    const renderContent = () => {
        if (!formattedValue) {
            return <DefaultContentRenderer styles={{
                root: {
                    color: theme.semanticColors.inputPlaceholderText
                }
            }}>---</DefaultContentRenderer>
        }
        if (column.isPrimary && isNavigationEnabled) {
            return <Link {...getLinkProps()}>{formattedValue}</Link>
        }
        switch (dataType) {
            case DataTypes.SingleLineEmail:
            case DataTypes.SingleLinePhone:
            case DataTypes.SingleLineUrl:
            case DataTypes.LookupCustomer:
            case DataTypes.LookupOwner:
            case DataTypes.LookupSimple:
            case DataTypes.LookupRegarding: {
                return <Link {...getLinkProps()}>{formattedValue}</Link>
            }
            case DataTypes.OptionSet:
            case DataTypes.MultiSelectOptionSet: {
                return <OptionSet context={props.context} parameters={{ ...props.parameters }} />
            }
            case DataTypes.File: {
                return (<div className={styles.fileWrapper}>
                    <Icon iconName='Attach' />
                    <Link {...getLinkProps()}>{labels.download()}</Link>
                </div>);
            }
            case DataTypes.Image: {
                return (<div className={styles.fileWrapper}>
                    <Image className={styles.fileImage} src={`data:image/png;base64,${formattedValue}`} />
                    <Link {...getLinkProps()}>{labels.download()}</Link>
                </div>);
            }
        }
        return <DefaultContentRenderer>{formattedValue}</DefaultContentRenderer>
    }

    const downloadFile = () => {
        const storage = new FileAttribute(props.context.webAPI);
        const namedReference = record.getNamedReference();
        storage.downloadFileFromAttribute({
            //@ts-ignore - PowerApps do not follow the typings
            entityName: namedReference.etn ?? namedReference.entityName,
            recordId: record.getRecordId(),
            fileAttribute: column.name,
        }, true)
    }

    const componentProps = onOverrideComponentProps({
        linkProps: {
            rel: 'noopener noreferrer'
        }
    });

    return <ThemeProvider className={styles.root} theme={theme}>
        {renderContent()}
    </ThemeProvider>
}

export const DefaultContentRenderer = (props: ITextProps) => {
    const styles = useMemo(() => getDefaultContentRendererStyles(), []);
    return <FluentText
        className={`${styles.content}${props.className ? ` ${props.className}` : ''}`}
        {...props}>
        {props.children}
    </FluentText>
}


