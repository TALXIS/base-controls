import { useRef } from "react"

export const useFetchXml = (webApi: ComponentFramework.WebApi): [
    (viewId: string) => Promise<string>
] => {
    const cachedFetchXml = useRef<{
        [viewId: string]: Promise<ComponentFramework.WebApi.Entity>
    }>({});

    const get = async (viewId: string): Promise<string> => {
        if(!cachedFetchXml.current[viewId]) {
            cachedFetchXml.current[viewId] = webApi.retrieveRecord('savedquery', viewId, '?$select=fetchxml');
        }
        return (await cachedFetchXml.current[viewId]).fetchxml;
    }
    return [get]
}