/** Which Fluent icon stands for a file, from the only thing its name says about it. */
export const getFileIconName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'pdf': {
            return 'PDF';
        }
        case 'doc':
        case 'docx': {
            return 'WordDocument';
        }
        case 'xls':
        case 'xlsx':
        case 'csv': {
            return 'ExcelDocument';
        }
        case 'ppt':
        case 'pptx': {
            return 'PowerPointDocument';
        }
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'bmp':
        case 'svg':
        case 'webp': {
            return 'FileImage';
        }
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz': {
            return 'ZipFolder';
        }
        case 'txt':
        case 'log':
        case 'md': {
            return 'TextDocument';
        }
        case 'msg':
        case 'eml': {
            return 'Mail';
        }
        default: {
            return 'Page';
        }
    }
};
