import { useEffect, useState } from "react";
import { useGridInstance } from "../../core/hooks/useGridInstance"

interface IPagingController {
    pageNumber: number,
    pageSize: number,
    totalResultCount: number,
    hasPreviousPage: boolean,
    hasNextPage: boolean,
    pageFirstRecordOrder: number,
    pageLastRecordOrder: number,
    loadNextPage: () => void,
    loadPreviousPage: () => void,
    loadExactPage: (pageNumber: number) => void,
    setPageSize: (pageSize: number) => void,
    reset: () => void
}

export const usePagingController = (): IPagingController => {
    const paging = useGridInstance().paging;
    const getController = (): IPagingController => {
        return {
            pageNumber: paging.pageNumber,
            pageSize: paging.pageSize,
            totalResultCount: paging.totalResultCount,
            hasPreviousPage: paging.hasPreviousPage,
            hasNextPage: paging.hasNextPage,
            pageFirstRecordOrder: paging.pageFirstRecordOrder,
            pageLastRecordOrder: paging.pageLastRecordOrder,
            loadExactPage: (pageNumber: number) => paging.loadExactPage(pageNumber),
            loadNextPage: () => paging.loadNextPage(),
            loadPreviousPage: () => paging.loadPreviousPage(),
            setPageSize: (pageSize) => paging.setPageSize(pageSize),
            reset: () => paging.reset()
        }
    }
    const [controller, setController] = useState<IPagingController>(() => getController());

    useEffect(() => {
        setController(getController());
    }, [paging.pageNumber, paging.pageSize, paging.totalResultCount])

    return controller;
}