import { useState } from "react"

export const useRerender = (): [
    boolean,
    (fn: () => any | Promise<any>) => void
] => {
    const [rerender, setRerender] = useState<boolean>(false);

    const renderDecorator = async (fn: () => any | Promise<any>) => {
        await fn();
        setRerender(!rerender);
    }

    return [rerender, renderDecorator];
}