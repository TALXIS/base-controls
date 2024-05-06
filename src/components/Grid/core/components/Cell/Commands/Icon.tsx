import React from 'react';
import 'external-svg-loader';
import { commandStyles } from './styles';

interface IIcon {
    src: string;
}

export const Icon = ({ src }: IIcon) => {
    return (
        <svg data-src={src} className={commandStyles.icon} />
    );
};