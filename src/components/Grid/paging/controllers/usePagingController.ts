import { useGridInstance } from "../../core/hooks/useGridInstance"

interface IPagingController {
    isEnabled: boolean,
    pageNumber: number,
    pageSize: number,
    totalResultCount: number,
    hasPreviousPage: boolean,
    hasNextPage: boolean,
    pageFirstRecordOrder: number,
    pageLastRecordOrder: string
    formattedTotalResultCount: string,
    loadNextPage: () => void,
    loadPreviousPage: () => void,
    loadExactPage: (pageNumber: number) => void,
    setPageSize: (pageSize: number) => void,
    reset: () => void
}

export const usePagingController = (): IPagingController => {
    const paging = useGridInstance().paging;
    return {
        pageNumber: paging.pageNumber,
            pageSize: paging.pageSize,
            totalResultCount: paging.totalResultCount,
            formattedTotalResultCount: paging.formattedTotalResultCount,
            hasPreviousPage: paging.hasPreviousPage,
            hasNextPage: paging.hasNextPage,
            pageFirstRecordOrder: paging.pageFirstRecordOrder,
            pageLastRecordOrder: paging.pageLastRecordOrder,
            isEnabled: paging.isEnabled,
            loadExactPage: (pageNumber: number) => paging.loadExactPage(pageNumber),
            loadNextPage: () => paging.loadNextPage(),
            loadPreviousPage: () => paging.loadPreviousPage(),
            setPageSize: (pageSize) => paging.setPageSize(pageSize),
            reset: () => paging.reset()
    }
}