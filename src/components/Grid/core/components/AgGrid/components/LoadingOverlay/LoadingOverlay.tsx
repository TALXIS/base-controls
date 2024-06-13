import { useTheme } from '@fluentui/react';
import React from 'react';
import { getLoadingOverlayStyles } from './styles';

export const LoadingOverlay = () => {
    const styles = getLoadingOverlayStyles(useTheme());
    return <div className={styles.root}>
        <div className={styles.tail} />
    </div>
}