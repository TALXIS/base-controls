import { memo, useMemo } from 'react';
import 'external-svg-loader';
import { Client } from '@talxis/client-libraries';
import { mergeStyleSets } from '@fluentui/react';

interface IIcon {
    name: string
}

const client = new Client();

const styles = mergeStyleSets({
    icon: {
        width: 16,
        height: 16,
        marginLeft: 4,
        marginRight: 4,
    }
})

const IconComponent = ({ name }: IIcon) => {

    const getWebResourceUrl = () => {
        if(client.isTalxisPortal()) {
            return name;
        }
        const array = name.split('$webresource:');
        return `https://${window.location.host}${window.Xrm.Utility.getGlobalContext().getWebResourceUrl(array[1] ?? name)}`
    }

    const src = useMemo(() => {
        return getWebResourceUrl();
    }, [name]);

    return (
        <svg data-src={src} className={styles.icon} />
    );
};

export const Icon = memo(IconComponent);
