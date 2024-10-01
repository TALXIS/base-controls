import { useRef } from "react"
import { IEntity } from "../interfaces";
import { FetchXmlBuilder } from "@talxis/client-libraries";

export const useFetchXml = (context: ComponentFramework.Context<any>): [
    (viewId: string) => Promise<{fetchXml: string, layoutJson: string}>,
    (entity: IEntity, fetchXml: string, query: string) => Promise<string>
] => {
    const cachedFetchXml = useRef<{
        [viewId: string]: Promise<any>
    }>({});

    const get = async (viewId: string): Promise<{fetchXml: string, layoutJson: string}> => {
        if (!cachedFetchXml.current[viewId]) {
            cachedFetchXml.current[viewId] = context.webAPI.retrieveRecord('savedquery', viewId, '?$select=fetchxml,layoutjson');
        }

        return await cachedFetchXml.current[viewId];
    }
    const applyLookupQuery = async (entity: IEntity, fetchXml: string, query: string): Promise<string> => {
        if (!query) {
            return fetchXml
        }
        const metadata = await entity.metadata;
        const xmlObject = FetchXmlBuilder.fetch.fromXml(fetchXml);
        xmlObject.entity.addFilter(new FetchXmlBuilder.filter(FetchXmlBuilder.FilterType.Or, [
            new FetchXmlBuilder.condition(metadata.PrimaryNameAttribute, FetchXmlBuilder.Operator.Like, [new FetchXmlBuilder.value(`%${query}%`)])
        ]))
        return xmlObject.toXml();
    }
    return [get, applyLookupQuery]
}