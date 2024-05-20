import React, { useMemo } from 'react';
import 'external-svg-loader';
import { commandStyles } from './styles';

interface IIcon {
    name: string
}

export const Icon = ({ name }: IIcon) => {
    //@ts-ignore - types
    const src = useMemo(() => `https://${window.location.host}${window.Xrm.Utility.getGlobalContext().getWebResourceUrl('msdyn_AIBuilder.svg')}`, [])
    return (
        <svg data-src={src} className={commandStyles.icon} />
    );
};