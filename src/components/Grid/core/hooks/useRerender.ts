import { useEffect, useState } from "react"

export const useRerender = (): [
    number,
    (fn?: () => any | Promise<any>) => void
] => {
    const [rerender, setRerender] = useState<number>(0);

    const renderDecorator = async (fn?: () => any | Promise<any>) => {
        await fn?.();
        setRerender(c => c + 1);
    }

    return [rerender, renderDecorator];
}