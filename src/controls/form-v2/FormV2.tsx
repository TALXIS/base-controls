import type { ILoadingBoundaryComponents } from "@ui/loading-boundary";
import { useLatest } from "@core";
import { RuntimeHost } from "@controls/runtime-host";
import { FormRuntime } from "./runtime/FormRuntime";
import type { IForm, IFormLoadResult, IFormModule } from "./runtime/interfaces";
import { FormV2Mount, IFormV2Components } from "./adapters/root";
import { FormV2Ui } from "./ui";

/** Props for `FormV2`. */
export interface IFormV2Props {
    /** Resolves the record, behind the skeleton; called on every mount. */
    onLoad: (form: IForm) => IFormLoadResult | Promise<IFormLoadResult>;
    /** The form's modules; read on every mount. */
    modules?: IFormModule[];
    /** Saves the record after each change the user commits. */
    enableAutoSave?: boolean;
    /** Added to the form's box. */
    className?: string;
    /** Replacements for the box, the skeleton and the error. */
    components?: IFormV2Components;
    /** Called with the form of each mount, before its init; subscribe to its events here. */
    onSetup?: (form: IForm) => void;
    /** Called once per mount when every part is drawn, including those on tabs not opened. */
    onReady?: (form: IForm) => void;
    /** The tabs, sections and controls. */
    children?: React.ReactNode;
}

/** Loads the record and holds every part of the form; every reload mounts it anew. */
export const FormV2Root = (props: IFormV2Props) => {
    const propsRef = useLatest(props);

    const { skeleton, ...hostComponents } = props.components ?? {};
    const placeholder: Partial<ILoadingBoundaryComponents> = {
        onRender: () => <FormV2Ui.Skeleton components={skeleton} />,
    };

    return <RuntimeHost<FormRuntime>
        createRuntime={() => new FormRuntime({ getProps: () => propsRef.current })}
        onSetup={form => propsRef.current.onSetup?.(form)}
        onReady={form => propsRef.current.onReady?.(form)}
        className={props.className}
        components={{ ...hostComponents, placeholder }}>
        <FormV2Mount>{props.children}</FormV2Mount>
    </RuntimeHost>;
};
