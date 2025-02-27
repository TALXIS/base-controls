import { useEffect, useState } from "react";


//triggering the focus state immediately can cause issues in some cases => delay can prevent them
export const useFocusIn = (ref: React.RefObject<HTMLElement>, delay?: number): boolean => {
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const triggerIsFocused = (value: boolean) => {
        if(typeof delay !== 'number') {
            setIsFocused(value);
            return;
        }
        setTimeout(() => {
            setIsFocused(value);
        }, delay);
    }

    useEffect(() => {
        const onFocus = (e: FocusEvent) => {
            triggerIsFocused(true);
        }
        const onBlur = (e: FocusEvent) => {
            triggerIsFocused(false);
        }
        ref.current?.addEventListener('focusin', (e) => onFocus(e));
        ref.current?.addEventListener('focusout', (e) => onBlur(e));

        return () => {
            ref.current?.removeEventListener('focusin', onFocus);
            ref.current?.removeEventListener('focusout', onBlur);
        }
    }, []);
    return isFocused
};