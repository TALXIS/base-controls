import { Icon, IIconProps, ILinkProps, Image, Link, SpinnerSize, ThemeProvider } from "@fluentui/react";
import { useControl } from "../../hooks";
import { useMemo, useState } from "react";
import { getDefaultContentRendererStyles, getGridCellLabelStyles } from "./styles";
import { Attribute, Client, DataType, DataTypes, FetchXmlDataProvider, FileAttribute, IRecord, Sanitizer } from "@talxis/client-libraries";
import { OptionSet } from './OptionSet';
import { IGridCellRenderer } from "./interfaces";
import { getDefaultGridRendererTranslations } from "./translations";
import { ComponentPropsContext } from "./useComponentProps";
import { DefaultContentRenderer } from "./DefaultContentRenderer";
import { getClassNames, Spinner } from "@talxis/react-components";

const client = new Client();

export const GridCellRenderer = (props: IGridCellRenderer) => {
    const dataset = props.parameters.Dataset.raw;
    const context = props.context;
    const record: IRecord = props.parameters.Record.raw;
    const column = props.parameters.Column.raw;
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
    const [downloadInProgress, setIsDownloadInProgress] = useState(false);

    const getLinkProps = (): ILinkProps => {
        const props: ILinkProps = {
            title: formattedValue,
            className: styles.link,
            rel: 'noopener noreferrer',
            children: formattedValue,
            disabled: downloadInProgress
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
                if (dataType === 'Image') {
                    props.title = value.fileName;
                    props.children = value.fileName;
                }
                if (shouldUsePortalDownload()) {
                    props.onClick = (e) => downloadPortalFile(e);
                }
                break;
            }
            case DataTypes.LookupCustomer:
            case DataTypes.LookupOwner:
            case DataTypes.LookupSimple:
            case DataTypes.LookupRegarding: {
                props.onClick = () => {
                    dataset.openDatasetItem(Sanitizer.Lookup.getEntityReference(value[0]))
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


    //matching could be improved
    const getIconNameForMimeType = (mimeType?: string) => {
        if (!mimeType) {
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
                if(isNavigationEnabled) {
                    const linkProps = componentProps.onGetLinkProps(getLinkProps());
                    return <Link {...linkProps}>{linkProps.children}</Link>
                }
                return <DefaultContentRenderer />
            }
            case DataTypes.OptionSet:
            case DataTypes.MultiSelectOptionSet:
            case DataTypes.TwoOptions: {
                return <OptionSet context={props.context} parameters={{ ...props.parameters }} />
            }
            case DataTypes.File:
            case DataTypes.Image: {
                return renderFileLink(dataType === 'Image');
            }
        }
        return <DefaultContentRenderer />
    }

    const shouldUsePortalDownload = () => {
        const isFetchXmlDataProvider = dataset.getDataProvider() instanceof FetchXmlDataProvider;
        //only use portal download if within portal, uses fetch xml provider and is not virtual column
        if(client.isTalxisPortal() && isFetchXmlDataProvider && !column.name.endsWith('__virtual')) {
            return true;
        }
        return false;
    }

    const renderFileLink = (isImage?: boolean) => {
        const linkProps = componentProps.onGetLinkProps(getLinkProps());
        return (<div {...componentProps.fileProps.containerProps}>
            {!downloadInProgress &&
                <>
                    {!isImage &&
                        <Icon {...componentProps.fileProps.iconProps} iconName={componentProps.fileProps.iconProps.onGetIconName(getIconNameForMimeType(value.mimeType))} />
                    }
                    {isImage &&
                        <Image {...componentProps.fileProps.imageProps} src={getThumbnailUrl()} />
                     }
                </>
            }
            {downloadInProgress &&
                <Spinner {...componentProps.fileProps.loadingProps.spinnerProps} />
            }
            <Link {...linkProps}>{linkProps.children}</Link>
        </div>);
    }

    const getIconProps = (json?: string | null): IIconProps | undefined => {
        if (!json) {
            return undefined;
        }
        return JSON.parse(json);
    }

    const getThumbnailUrl = () => {
        let src = value.thumbnailUrl;
        if (client.isTalxisPortal()) {
            src = `data:${value.mimeType};base64,${value.fileContent}`
        }
        return componentProps.fileProps.imageProps.onGetSrc(src);
    }

    const downloadPortalFile = async (e: React.MouseEvent<HTMLAnchorElement | HTMLElement | HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        setIsDownloadInProgress(true);
        const storage = new FileAttribute(context.webAPI);
        let entityName = dataset.getTargetEntityType();
        let recordId = record.getRecordId();
        let attributeName = Attribute.GetNameFromAlias(column.name);
        const entityAliasName = Attribute.GetLinkedEntityAlias(column.name);

        if (entityAliasName) {
            entityName = dataset.linking.getLinkedEntities().find(x => x.alias === entityAliasName)!.name;
            const entityMetadata = await context.utils.getEntityMetadata(entityName, []);
            recordId = record.getRawData()![`${entityAliasName}.${entityMetadata.PrimaryIdAttribute}`];
        }
        await storage.downloadFileFromAttribute({
            entityName: entityName,
            recordId: recordId,
            fileAttribute: attributeName
        }, true, undefined, {
            fileName: value.fileName,
            fileSizeInBytes: value.fileSize
        })
        setIsDownloadInProgress(false);
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
            },
            loadingProps: {
                spinnerProps: {
                    size: SpinnerSize.small,
                    styles: {
                        circle: styles.loadingSpinnerCircle
                    }
                }
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

    return <ThemeProvider {...componentProps.rootContainerProps}>
        <ComponentPropsContext.Provider value={componentPropsProviderValue}>
            {prefixIconProps && <Icon {...prefixIconProps} className={getClassNames([prefixIconProps.className, styles.icon])} />}
            <div {...componentProps.contentWrapperProps}>
                {componentProps.contentWrapperProps.children ?? renderContent()}
            </div>
            {suffixIconProps && <Icon {...suffixIconProps} className={getClassNames([suffixIconProps.className, styles.icon])} />}
        </ComponentPropsContext.Provider>
    </ThemeProvider>
}


