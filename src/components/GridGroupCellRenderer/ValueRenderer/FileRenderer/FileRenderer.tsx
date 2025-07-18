import React, { useMemo } from "react";
import { useModel } from "../../useModel";
import { IFileRendererProps as IFileRendererPropsBase } from "../../interfaces";
import { Link, SpinnerSize, Image, Icon, ImageFit } from "@fluentui/react";
import { getFileRendererStyles } from "./styles";
import { Spinner } from "@talxis/react-components";

interface IFileRendererProps {
    onRenderFile: (props: IFileRendererPropsBase, defaultRender: (props: IFileRendererPropsBase) => React.ReactElement) => React.ReactElement;
}

export const FileRenderer = (props: IFileRendererProps) => {
    const model = useModel();
    const styles = useMemo(() => getFileRendererStyles(), [])
    const [isFileDownloading, setIsFileDownloading] = React.useState(false);
    const [thumbnailFailedToLoad, setThumbnailFailedToLoad] = React.useState(false);

    const onLinkClick = async (e: React.MouseEvent<HTMLElement | HTMLAnchorElement | HTMLButtonElement, MouseEvent>) => {
        if (true) {
            e.preventDefault();
            setIsFileDownloading(true);
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true);
                }, 5000);
            })
            //await model.downloadPortalFile();
            setIsFileDownloading(false);
        }
    }

    const onRenderLoadingPrefix = (props: IFileRendererPropsBase) => {
        const thumbnailUrl = model.getImageThumbnailUrl();
        if (isFileDownloading) {
            return props.onRenderLoading({
                size: SpinnerSize.xSmall,
                styles: {
                    circle: styles.spinner
                }
            }, (props) => {
                return <Spinner {...props} />
            })
        }
        else if (thumbnailUrl && !thumbnailFailedToLoad) {
            return props.onRenderImageThumbnail({
                src: thumbnailUrl,
                styles: {
                    image: styles.thumbnail
                },
                onLoadingStateChange: (state) => {
                    if(state == 2) {
                        setThumbnailFailedToLoad(true);
                    }
                }
            }, (props) => {
                return <Image {...props} />
            })
        }
        else {
            return props.onRenderFileAttachmentIcon({
                iconName: model.getFileAttachmentIcon()
            }, (props) => {
                return <Icon {...props} />
            })
        }
    }

    return props.onRenderFile({
        container: {
            className: styles.fileRendererRoot
        },
        onRenderFileAttachmentIcon: (props, defaultRender) => defaultRender(props),
        onRenderImageThumbnail: (props, defaultRender) => defaultRender(props),
        onRenderLoading: (props, defaultRender) => defaultRender(props),
        onRenderLink: (props, defaultRender) => defaultRender(props)

    }, (props) => {
        return <div {...props.container}>
            {onRenderLoadingPrefix(props)}
            {props.onRenderLink({
                ...model.getLinkProps(),
                className: styles.link,
                onClick: onLinkClick,
            }, (props) => {
                return <Link {...props} />
            })}
        </div>
    })
}