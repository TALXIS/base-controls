import  {useState } from "react"
import { useIsMounted } from "./useIsMounted";

export const useIsLoading = <T>(fn: () => Promise<T>): [boolean, () => Promise<T>] => {
    const [isLoading, setIsLoading] = useState(false);
    const isMounted = useIsMounted();

    const execute = async () => {
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