import { useRuntime } from "@controls/runtime-host";
import type { FormRuntime } from "../../runtime/FormRuntime";
import { FormV2Context } from "./context";

/** One mount of the form: its parts, drawn on that mount's ready runtime. */
export const FormV2Mount = (props: { children?: React.ReactNode }) => {
    const runtime = useRuntime<FormRuntime>();
    return <FormV2Context.Provider value={runtime}>{props.children}</FormV2Context.Provider>;
};
