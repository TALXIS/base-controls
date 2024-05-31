import { SpinnerSize } from '@fluentui/react';
import { Spinner } from '@fluentui/react/lib/components/Spinner/Spinner';
import React from 'react';

export const LoadingOverlay = () => {
    return <Spinner size={SpinnerSize.large} />
}