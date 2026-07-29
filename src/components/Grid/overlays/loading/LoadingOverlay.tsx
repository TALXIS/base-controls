import { SpinnerSize, Text } from '@fluentui/react';
import { Spinner } from '@legacy';
import { useGridInstance } from '@components/Grid/grid/useGridInstance';
import { useMemo } from 'react';
import { getLoadingOverlayStyles } from './styles';

export const LoadingOverlay = () => {
    const grid = useGridInstance();
    const provider = grid.getDataset().getDataProvider();
    const loadingMessage = provider.getLoadingMessage();
    const styles = useMemo(() => getLoadingOverlayStyles(), []);

    return <div className={styles.root}>
        <Spinner size={SpinnerSize.large} />
        {loadingMessage && 
            <Text variant='large' className={styles.message}>{loadingMessage}</Text>
        }
    </div>
}