import { useEffect, useState } from "react";

export const useMouseOver = (ref: React.RefObject<HTMLElement>): boolean => {
    const [isMouseOver, setIsMouseOver] = useState<boolean>(false);

    useEffect(() => {
        const onMouseEnter = () => {
            setIsMouseOver(true);
        }
        const onMouseLeave = () => {
            setIsMouseOver(false);
        }
        ref.current?.addEventListener('mouseenter', onMouseEnter);
        ref.current?.addEventListener('mouseleave', onMouseLeave);

        return () => {
            ref.current?.removeEventListener('mouseenter',onMouseEnter);
            ref.current?.removeEventListener('mouseleave', onMouseLeave);
        }
    }, []);

    return isMouseOver;
};