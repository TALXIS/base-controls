import { useEffect, useState } from "react";

export const useFocusIn = (ref: React.RefObject<HTMLElement>): boolean => {
    const [isFocused, setIsFocused] = useState<boolean>(false);

    useEffect(() => {
        const onFocus = () => {
            setIsFocused(true);
        }
        const onBlur = () => {
            setIsFocused(false);
        }
        ref.current?.addEventListener('focusin', onFocus);
        ref.current?.addEventListener('focusout', onBlur);

        return () => {
            ref.current?.removeEventListener('focusin', onFocus);
            ref.current?.removeEventListener('focusout', onBlur);
        }
    }, []);

    return isFocused
};