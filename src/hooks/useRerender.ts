import { useState } from "react"

export const useRerender = () => {
    const [_, toggle] = useState<boolean>(false);

    return () => toggle(!_);
}