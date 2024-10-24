import { memo } from 'react';
import 'external-svg-loader';
import { commandStyles } from './styles';

interface IIcon {
    name: string
}

const IconComponent = ({ name }: IIcon) => {
    //@ts-ignore - types
    const src = !window.TALXIS?.Portal ? `https://${window.location.host}${window.Xrm.Utility.getGlobalContext().getWebResourceUrl(name)}` : name;
    return (
        <svg data-src={src} className={commandStyles.icon} />
    );
};

export const Icon = memo(IconComponent);
