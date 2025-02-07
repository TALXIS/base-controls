import { Icon, IIconProps, ILinkProps, Image, Link, ThemeProvider } from "@fluentui/react";
import { useControl } from "../../hooks";
import { useMemo } from "react";
import { getDefaultContentRendererStyles, getGridCellLabelStyles } from "./styles";
import { DataType, DataTypes, FileAttribute, IRecord } from "@talxis/client-libraries";
import { OptionSet } from './OptionSet';
import { IGridCellRenderer } from "./interfaces";
import { getDefaultGridRendererTranslations } from "./translations";
import { ComponentPropsContext } from "./useComponentProps";
import { getClassNames } from "../../utils/styling/getClassNames";
import { DefaultContentRenderer } from "./DefaultContentRenderer";

export const GridCellRenderer = (props: IGridCellRenderer) => {
    const dataset = props.parameters.Dataset;
    const record: IRecord = props.parameters.Record;
    const column = props.parameters.Column;
    const columnAlignment = props.parameters.ColumnAlignment.raw;
    const dataType: DataType = props.parameters.value.type as DataType;
    const { theme, sizing } = useControl('GridCellLabel', props, getDefaultGridRendererTranslations());
    const styles = useMemo(() => getGridCellLabelStyles(columnAlignment ?? 'left', dataType, sizing.height!, theme), [columnAlignment, dataType, sizing.height, theme]);
    const defaultContentRendererStyles = useMemo(() => getDefaultContentRendererStyles(theme, dataType, sizing.height!), [theme, dataType, sizing.height]);
    const value = props.parameters.value.raw;
    const formattedValue: string = props.parameters.value.formatted;
    const isNavigationEnabled = props.parameters.EnableNavigation.raw;
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
                props.href = value.fileUrl;
                props.download = value.fileName;
                if(dataType === 'Image') {
                    props.title = value.fileName;
                    props.children = value.fileName;
                }
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

    const getIconNameForMimeType = (mimeType?: string) => {
        if(!mimeType) {
            return 'Attach';
        }
        const icon_classes: any = {
            image: "Photo2",
            audio: "MusicNote",
            video: "Video",
            "application/pdf": "PDF",
            "application/msword": "WordDocument",
            "application/vnd.ms-word": "WordDocument",
            "application/vnd.oasis.opendocument.text": "WordDocument",
            "application/vnd.openxmlformats-officedocument.wordprocessingml": "WordDocument",
            "application/vnd.ms-excel": "ExcelDocument",
            "application/vnd.openxmlformats-officedocument.spreadsheetml": "ExcelDocument",
            "application/vnd.oasis.opendocument.spreadsheet": "ExcelDocument",
            "application/vnd.ms-powerpoint": "PowerPointDocument",
            "application/vnd.openxmlformats-officedocument.presentationml": "PowerPointDocument",
            "application/vnd.oasis.opendocument.presentation": "PowerPointDocument",
            "text/plain": "TextDocument",
            "text/html": "FileCode",
            "application/json": "FileCode",
            // Archives
            "application/gzip": "ZipFolder",
            "application/zip": "ZipFolder"
        };

        if (icon_classes[mimeType]) {
            return icon_classes[mimeType];
        }
        else if (icon_classes[mimeType.split("/")[0]]) {
            return icon_classes[mimeType.split("/")[0]];
        }
        return 'Attach';
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
                    <Icon {...componentProps.fileProps.iconProps} iconName={componentProps.fileProps.iconProps.onGetIconName(getIconNameForMimeType(value.mimeType))} />
                    <Link {...linkProps}>{linkProps.children}</Link>
                </div>);
            }
            case DataTypes.Image: {
                const linkProps = componentProps.onGetLinkProps(getLinkProps());
                return (<div {...componentProps.fileProps.containerProps}>
                    <Image {...componentProps.fileProps.imageProps} src={componentProps.fileProps.imageProps.onGetSrc(value.thumbnailUrl)} />
                    <Link {...linkProps}>{linkProps.children}</Link>
                </div>);
            }
        }
        return <DefaultContentRenderer />
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
            className: styles.contentWrapper,
        },
        textProps: {
            className: getClassNames([defaultContentRendererStyles.content, !formattedValue ? defaultContentRendererStyles.placeholder : undefined]),
            title: formattedValue,
            children: column.type === 'action' ? '' : (formattedValue || '---')
        },
        fileProps: {
            containerProps: {
                className: styles.fileWrapper
            },
            iconProps: {
                className: styles.fileIcon,
                onGetIconName: (iconName) => iconName
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
    const suffixIconProps = getIconProps(suffixIcon)

    return <ThemeProvider {...componentProps.rootContainerProps} theme={theme}>
        <ComponentPropsContext.Provider value={componentPropsProviderValue}>
            {prefixIconProps && <Icon {...prefixIconProps} className={getClassNames([prefixIconProps.className, styles.icon])} />}
            <div {...componentProps.contentWrapperProps}>
                {componentProps.contentWrapperProps.children ?? renderContent()}
            </div>
            {suffixIconProps && <Icon {...suffixIconProps} className={getClassNames([suffixIconProps.className, styles.icon])} />}
        </ComponentPropsContext.Provider>
    </ThemeProvider>
}


