import { useMemo, useState } from "react";
import { Icon, Image, ImageFit, Link } from "@fluentui/react";
import { IFileValue } from "../../interfaces";
import { getFileIconName } from "./getFileIconName";
import { getFieldFileStyles } from "./styles";

export interface IFieldFileProps {
    file: IFileValue;
    /** Whether it is drawn as a picture of itself rather than as an icon. */
    isImage: boolean;
}

/** A file: what it is, what it is called, and a link to its contents. */
export const FieldFile = (props: IFieldFileProps) => {
    const { file, isImage } = props;
    const styles = useMemo(() => getFieldFileStyles(), []);
    //an image whose url the browser could not load falls back to the icon rather than to a broken frame
    const [hasThumbnailFailed, setHasThumbnailFailed] = useState<boolean>(false);
    const thumbnailUrl = file.thumbnailUrl ?? file.fileUrl;

    const renderIcon = (): JSX.Element => {
        if (isImage && thumbnailUrl && !hasThumbnailFailed) {
            return <Image
                src={thumbnailUrl}
                alt={file.fileName}
                imageFit={ImageFit.contain}
                styles={{ image: styles.thumbnail }}
                onLoadingStateChange={state => setHasThumbnailFailed(state === 2)} />;
        }
        return <Icon className={styles.icon} iconName={getFileIconName(file.fileName)} />;
    };

    return <div className={styles.fileRoot}>
        {renderIcon()}
        <Link
            className={styles.name}
            title={file.fileName}
            href={file.fileUrl}
            download={file.fileName}
            target='_blank'
            rel='noopener noreferrer'>
            {file.fileName}
        </Link>
    </div>;
};
