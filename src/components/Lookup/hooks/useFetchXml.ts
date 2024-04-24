import { useRef } from "react"
import { IEntity } from "../interfaces";
import { Sdk } from "../lib";

export const useFetchXml = (context: ComponentFramework.Context<any>): [
    (viewId: string) => Promise<string>,
    (entity: IEntity, fetchXml: string, query: string) => string
] => {
    const cachedFetchXml = useRef<{
        [viewId: string]: Promise<ComponentFramework.WebApi.Entity>
    }>({});

    const get = async (viewId: string): Promise<string> => {
        if (!cachedFetchXml.current[viewId]) {
            cachedFetchXml.current[viewId] = context.webAPI.retrieveRecord('savedquery', viewId, '?$select=fetchxml');
        }
        return (await cachedFetchXml.current[viewId]).fetchxml;
    }
    const applyLookupQuery = (entity: IEntity, fetchXml: string, query: string): string => {
        if (!query) {
            return fetchXml
        }
        const xmlObject = Sdk.FetchXml.fetch.fromXml(fetchXml);
        xmlObject.entity.addFilter(new Sdk.FetchXml.filter(Sdk.FetchXml.FilterType.Or, [
            new Sdk.FetchXml.condition(entity.metadata.PrimaryNameAttribute, Sdk.FetchXml.Operator.Like, [new Sdk.FetchXml.value(`%${query}%`)])
        ]))
        return xmlObject.toXml();
    }
    return [get, applyLookupQuery]

    /*   .addFilter(
          ns.filter(ns.FilterType.And)
          .addCondition(
              ns.condition(
                  "lastname",
                  ns.Operator.NotEqual,
                  [ns.value("Cannon")]
              )
          )
      ) */
}