export interface LogicxFile {
    getViewData(): string;
    setViewData(data: string, clear: boolean): void;
    clear(): void;
    getViewType(): string;
}