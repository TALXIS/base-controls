import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { getClassNames } from "@talxis/react-components";
import { useControl } from "../../../hooks";
import { IForm } from "../interfaces";
import { formTranslations } from "../translations";
import { FormContext } from "./FormContext";
import { FormModel } from "./FormModel";
import { FormTab } from "./parts/FormTab";

const buildFormInstance = (onGetProps: () => IForm, labels: any, theme: any, metadataProvider?: any): FormModel => {
    return new FormModel({
        labels,
        onGetProps,
        theme,
        metadataProvider,
    });
};

export const Form = (props: IForm) => {
    const { labels, theme, className } = useControl('Form', props, formTranslations);

    const propsRef = useRef<IForm>(props);
    propsRef.current = props;

    const form = useMemo(() => {
        return buildFormInstance(() => propsRef.current, labels, theme, props.metadataProvider);
    }, []);

    // Assign synchronously during render — `form` is stable so this is safe
    // and guarantees the ref is populated before any child or sibling effect runs,
    // including effects inside dynamically-compiled codeful snippets.
    if (props.formInstanceRef) {
        props.formInstanceRef.current = form;
    }

    // Run after every render so the model stays in sync with the latest record
    // from props. useLayoutEffect ensures this runs before sibling effects read
    // dirty state (e.g. DirtyBadge).
    useLayoutEffect(() => {
        form.syncRecordBinding();
    });

    // Fire OnLoad once on mount, then Loaded after OnLoad resolves.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            await form.fireOnLoad();
            if (!cancelled) {
                await form.fireLoaded();
            }
        })().catch((err) => {
            console.error('[Form] OnLoad/Loaded dispatch error:', err);
        });
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Clean up the ref on unmount.
    useEffect(() => {
        return () => {
            if (props.formInstanceRef && props.formInstanceRef.current === form) {
                props.formInstanceRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => {
            form.destroy();
        };
    }, []);

    const hasFormXml = !!props.parameters.FormXml?.raw;
    const hasChildren = props.children !== undefined && props.children !== null;

    return (
        <FormContext.Provider value={form}>
            <div className={getClassNames([className])}>
                {hasChildren && props.children}
                {!hasChildren && hasFormXml && <FormTab />}
            </div>
        </FormContext.Provider>
    );
};
