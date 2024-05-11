import { useEffect, useState } from "react";
import { useGridInstance } from "../../core/hooks/useGridInstance"

interface IPagingController {
    pageNumber: number,
    pageSize: number,
    totalResultCount: number,
    hasPreviousPage: boolean,
    hasNextPage: boolean,
    loadNextPage: () => void,
    loadPreviousPage: () => void,
    loadExactPage: (pageNumber: number) => void,
    reset: () => void
}

export const usePagingController = (): IPagingController => {
    const paging = useGridInstance().paging;
    const getController = (): IPagingController => {
        return {
            pageNumber: paging.pageNumber,
            pageSize: paging.pageSize,
            totalResultCount: paging.totalRecordCount,
            hasPreviousPage: paging.hasPreviousPage,
            hasNextPage: paging.hasNextPage,
            loadExactPage: (pageNumber: number) => paging.loadExactPage(pageNumber),
            loadNextPage: () => paging.loadNextPage(),
            loadPreviousPage: () => paging.loadPreviousPage(),
            reset: () => paging.reset()
        }
    }
    const [controller, setController] = useState<IPagingController>(() => getController());

    useEffect(() => {
        setController(getController());
    }, [paging.pageNumber, paging.pageSize, paging.totalRecordCount])

    return controller;
}