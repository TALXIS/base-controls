import { useEffect, useState } from "react";

export const useFocus = (ref: React.RefObject<HTMLElement>): boolean => {
    const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

    useEffect(() => {
        const onFocus = () => {
            setIsMouseOver(true);
        }
        const onBlur = () => {
            setIsMouseOver(false);
        }
        ref.current?.addEventListener('focus', onFocus);
        ref.current?.addEventListener('blur', onBlur);

        return () => {
            ref.current?.removeEventListener('focus', onFocus);
            ref.current?.removeEventListener('blur', onBlur);
        }
    }, []);

    return isMouseOver;
};