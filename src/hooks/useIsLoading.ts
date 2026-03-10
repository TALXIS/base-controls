import { useState } from "react"
import { useIsMounted } from "./useIsMounted";

export const useIsLoading = <TArgs extends unknown[], TResult>(fn: (...args: TArgs) => Promise<TResult>): [boolean, (...args: TArgs) => Promise<TResult>] => {
    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useIsMounted();

    const execute = async (...args: TArgs) => {
        setIsLoading(true);
        try {
            return await fn(...args);
        }
        finally {
            if (isMounted()) {
                setIsLoading(false);
            }
        }
    }

    return [isLoading, execute];
}