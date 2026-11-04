import { useEffect, useMemo } from "react";
import type { IFormPartMap } from "../../interfaces";
import type { IFormServiceMap } from "../../runtime/FormRuntime";
import { useForm } from "./context";

/** Creates a part once and registers it on the form while the calling component is mounted. */
export const useRegisterFormPart = <TName extends keyof IFormPartMap, TPart extends IFormServiceMap[TName]>(name: TName, onCreate: () => TPart): TPart => {
    const form = useForm();
    //registered as it is made: a part can be read before the first effect
    const part = useMemo(() => {
        const created = onCreate();
        form.services.register(name, () => created);
        return created;
    }, []);
    useEffect(() => () => {
        //a replacing part registers before this one unmounts
        if (form.services.find(name) as unknown === part) {
            form.services.unregister(name);
        }
    }, []);
    return part;
};
