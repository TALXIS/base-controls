import { useState } from "react"
import { useIsMounted } from "./useIsMounted";

export const useIsLoading = (): [boolean, (fn: () => Promise<any>) => Promise<any>] => {
    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useIsMounted();

    const execute = async (fn: () => Promise<any>) => {
        setIsLoading(true);
        try {
            return await fn();
        }
        finally {
            if (isMounted()) {
                setIsLoading(false);
            }
        }
    }

    return [isLoading, execute];
}