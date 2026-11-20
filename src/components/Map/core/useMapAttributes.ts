import { useEffect, useRef, useState } from 'react';
import { IDataset } from '@talxis/client-libraries';
import { registerLinkedMapAttributes } from './linking';

export interface IUseMapAttributes {
    dataset?: IDataset;
    /** Every attribute path the control was configured with, across all of its parameters. */
    paths: string[];
    /** Whether the control may add a missing link entity and column to the dataset. */
    enabled: boolean;
}

/**
 * Makes the dot notation attribute paths the control was configured with resolvable on the bound dataset.
 * Runs once per set of paths and does nothing when the dataset already carries them.
 */
export const useMapAttributes = (options: IUseMapAttributes): boolean => {
    const { dataset, paths, enabled } = options;
    const [isRegistering, setIsRegistering] = useState(false);
    //the paths are rebuilt every render, so the effect keys off their content rather than their identity
    const pathKey = paths.join('|');
    const attemptedRef = useRef<string>();

    useEffect(() => {
        if (!dataset || !enabled || attemptedRef.current === pathKey) {
            return;
        }
        attemptedRef.current = pathKey;
        let cancelled = false;
        setIsRegistering(true);
        registerLinkedMapAttributes(dataset, paths)
            .catch((error) => console.warn('Map: failed to prepare the dataset for the configured attributes:', error))
            .finally(() => {
                if (!cancelled) {
                    setIsRegistering(false);
                }
            });
        return () => {
            cancelled = true;
        };
        //paths is covered by pathKey, which is what keeps a rebuilt array from re-running this
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataset, enabled, pathKey]);

    return isRegistering;
};
