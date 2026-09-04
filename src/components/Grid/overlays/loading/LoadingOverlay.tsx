import { SpinnerSize, Text } from '@fluentui/react';
import { Spinner } from '@legacy';
import { useMemo } from 'react';
import { getLoadingOverlayStyles } from './styles';
import { useGridService } from "@components/Grid/grid/useGridService";

export const LoadingOverlay = () => {
    const provider = useGridService('provider');
    const loadingMessage = provider.getLoadingMessage();
    const styles = useMemo(() => getLoadingOverlayStyles(), []);

    return <div className={styles.root}>
        <Spinner size={SpinnerSize.large} />
        {loadingMessage && 
            <Text variant='large' className={styles.message}>{loadingMessage}</Text>
        }
    </div>
}