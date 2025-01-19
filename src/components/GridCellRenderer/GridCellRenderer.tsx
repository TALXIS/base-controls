import { Icon, IIconProps, ILinkProps, Image, ITextProps, Link, ThemeProvider } from "@fluentui/react";
import { useControl } from "../../hooks";
import { Text as FluentText } from '@fluentui/react';
import { useMemo } from "react";
import { getDefaultContentRendererStyles, getGridCellLabelStyles } from "./styles";
import { DataType, DataTypes, FileAttribute, IRecord } from "@talxis/client-libraries";
import { OptionSet } from './OptionSet';
import { IGridCellRenderer } from "./interfaces";
import { getDefaultGridRendererTranslations } from "./translations";

export const GridCellRenderer = (props: IGridCellRenderer) => {
    const dataset = props.parameters.Dataset;
    const record: IRecord = props.parameters.Record;
    const column = props.parameters.Column;
    const columnAlignment = props.parameters.ColumnAlignment?.raw;
    const { theme, labels } = useControl('GridCellLabel', props, getDefaultGridRendererTranslations());
    const styles = useMemo(() => getGridCellLabelStyles(columnAlignment ?? 'left'), [columnAlignment]);
    const dataType: DataType = props.parameters.value.type as DataType;
    const value: string = props.parameters.value.raw ?? '';
    const formattedValue: string = props.parameters.value.formatted || value;
    const isNavigationEnabled = props.parameters.EnableNavigation?.raw ?? true;
    const prefixIcon = props.parameters.PrefixIcon?.raw
    const suffixIcon = props.parameters.SuffixIcon?.raw;
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
            case DataTypes.MultiSelectOptionSet:
            case DataTypes.TwoOptions: {
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

    const getIconProps = (json?: string | null): IIconProps | undefined => {
        if (!json) {
            return undefined;
        }
        return JSON.parse(json);
    }

    const componentProps = onOverrideComponentProps({
        linkProps: {
            rel: 'noopener noreferrer'
        }
    });

    const prefixIconProps = getIconProps(prefixIcon);
    const suffixIconProps = getIconProps(suffixIcon);

    return <ThemeProvider className={styles.root} theme={theme}>
        {prefixIconProps && <Icon {...prefixIconProps} className={getClassNames([prefixIconProps.className, styles.icon])} />}
        <div className={styles.contentWrapper}>
            {renderContent()}
        </div>
        {suffixIconProps && <Icon {...suffixIconProps} className={getClassNames([suffixIconProps.className, styles.icon])} />}
    </ThemeProvider>
}

export const DefaultContentRenderer = (props: ITextProps) => {
    const styles = useMemo(() => getDefaultContentRendererStyles(), []);
    return <FluentText
        {...props}
        className={getClassNames([props.className, styles.content])}
        title={props.title ?? props.children as string}>
        {props.children}
    </FluentText>
}

const getClassNames = (classes: (string | undefined)[]): string | undefined => {
    let classNames = '';
    classes.map(className => {
        if (className) {
            classNames += ` ${className}`;
        }
    })
    return classNames || undefined;
}


