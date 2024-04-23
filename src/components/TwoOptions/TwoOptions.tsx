import { Toggle } from '@fluentui/react';
import React from 'react';
import { useComponent } from '../../hooks';
import { ITwoOptions } from './interfaces';

export const TwoOptions = (props: ITwoOptions) => {
    const [labels, notifyOutputChanged] = useComponent('TwoOptions', props);

    return <Toggle />
}