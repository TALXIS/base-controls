import { useMemo } from 'react';
import { getControlComponentLoadingStyles } from './styles';
import { Spinner } from '@talxis/react-components';



export const ControlComponentLoading = () => {
    const styles = useMemo(() => getControlComponentLoadingStyles(), [])
    return (
        <div className={styles.loadingRoot}>
            <Spinner />
        </div>
    );
}