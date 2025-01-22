import { Icon, IIconProps, ILinkProps, Image, Link, ThemeProvider } from "@fluentui/react";
import { useControl } from "../../hooks";
import { Text as FluentText } from '@fluentui/react';
import { createContext, useMemo } from "react";
import { getDefaultContentRendererStyles, getGridCellLabelStyles } from "./styles";
import { DataType, DataTypes, FileAttribute, IRecord } from "@talxis/client-libraries";
import { OptionSet } from './OptionSet';
import { IGridCellRenderer, IGridCellRendererComponentProps } from "./interfaces";
import { getDefaultGridRendererTranslations } from "./translations";
import { useComponentProps } from "./useComponentProps";
import { getClassNames } from "../../utils/styling/getClassNames";

export const ComponentPropsContext = createContext<{
    current: IGridCellRendererComponentProps
}>({} as any);

export const GridCellRenderer = (props: IGridCellRenderer) => {
    const dataset = props.parameters.Dataset;
    const record: IRecord = props.parameters.Record;
    const column = props.parameters.Column;
    const columnAlignment = props.parameters.ColumnAlignment?.raw;
    const { theme, labels } = useControl('GridCellLabel', props, getDefaultGridRendererTranslations());
    const styles = useMemo(() => getGridCellLabelStyles(columnAlignment ?? 'left'), [columnAlignment]);
    const defaultContentRendererStyles = useMemo(() => getDefaultContentRendererStyles(theme), [theme]);
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
            className: styles.link,
            rel: 'noopener noreferrer',
            children: formattedValue
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
                props.children = labels.download();
                break;
            }
            //primary navigation link
            default: {
                props.onClick = () => {
                    dataset.openDatasetItem(record.getNamedReference());
                }
            }
        }
        return props;
    }

    const renderContent = () => {
        if (!formattedValue) {
            return <DefaultContentRenderer />
        }
        if (column.isPrimary && isNavigationEnabled) {
            return <Link {...componentProps.onGetLinkProps(getLinkProps())}>{formattedValue}</Link>
        }
        switch (dataType) {
            case DataTypes.SingleLineEmail:
            case DataTypes.SingleLinePhone:
            case DataTypes.SingleLineUrl:
            case DataTypes.LookupCustomer:
            case DataTypes.LookupOwner:
            case DataTypes.LookupSimple:
            case DataTypes.LookupRegarding: {
                const linkProps = componentProps.onGetLinkProps(getLinkProps());
                return <Link {...linkProps}>{linkProps.children}</Link>
            }
            case DataTypes.OptionSet:
            case DataTypes.MultiSelectOptionSet:
            case DataTypes.TwoOptions: {
                return <OptionSet context={props.context} parameters={{ ...props.parameters }} />
            }
            case DataTypes.File: {
                const linkProps = componentProps.onGetLinkProps(getLinkProps());
                return (<div {...componentProps.fileProps.containerProps}>
                    <Icon {...componentProps.fileProps.iconProps} />
                    <Link {...linkProps}>{linkProps.children}</Link>
                </div>);
            }
            case DataTypes.Image: {
                const linkProps = componentProps.onGetLinkProps(getLinkProps());
                return (<div {...componentProps.fileProps.containerProps}>
                    <Image {...componentProps.fileProps.imageProps} src={componentProps.fileProps.imageProps.onGetSrc(`data:image/png;base64,${formattedValue}`)} />
                    <Link {...linkProps}>{linkProps.children}</Link>
                </div>);
            }
        }
        return <DefaultContentRenderer />
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
        onGetLinkProps: (props) => props,
        onGetOptionSetProps: (props) => props,
        rootContainerProps: {
            theme: theme,
            className: styles.root
        },
        contentWrapperProps: {
            className: styles.contentWrapper
        },
        textProps: {
            className: getClassNames([defaultContentRendererStyles.content, !formattedValue ? defaultContentRendererStyles.placeholder : undefined]),
            title: formattedValue,
            children: formattedValue || '---',
        },
        fileProps: {
            containerProps: {
                className: styles.fileWrapper
            },
            iconProps: {
                iconName: 'Attach'
            },
            imageProps: {
                className: styles.fileImage,
                onGetSrc: (src) => src
            }
        }
    });

    const componentPropsProviderValue = useMemo(() => {
        return {
            current: componentProps
        }
    }, []);
    componentPropsProviderValue.current = componentProps;

    //this allows to add prefix/sufix icon without the need of cell customizer
    //it can cover a lot of cases where otherwise custom PCF would be needed
    const prefixIconProps = getIconProps(prefixIcon);
    const suffixIconProps = getIconProps(suffixIcon);
    
    return <ThemeProvider {...componentProps.rootContainerProps}>
        <ComponentPropsContext.Provider value={componentPropsProviderValue}>
        {prefixIconProps && <Icon {...prefixIconProps} className={getClassNames([prefixIconProps.className, styles.icon])} />}
        <div {...componentProps.contentWrapperProps}>
            {renderContent()}
        </div>
        {suffixIconProps && <Icon {...suffixIconProps} className={getClassNames([suffixIconProps.className, styles.icon])} />}
        </ComponentPropsContext.Provider>
    </ThemeProvider>
}

export const DefaultContentRenderer = () => {
    const componentProps = useComponentProps();
    return <FluentText {...componentProps.textProps}>
        {componentProps.textProps.children}
    </FluentText>
}


