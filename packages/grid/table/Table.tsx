import {
  KeyboardEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  WheelEventHandler,
} from "react";
import { makePrefixer } from "@jpmorganchase/uitk-core";
import { TableColumnProps } from "./TableColumn";
import { TableContext } from "./TableContext";
import cx from "classnames";
import { CellMeasure } from "./CellMeasure";
import { Scrollable } from "./Scrollable";
import "./Table.css";
import { MiddlePart } from "./MiddlePart";
import { TopPart } from "./TopPart";
import { LeftPart } from "./LeftPart";
import { TopLeftPart } from "./TopLeftPart";
import { RightPart } from "./RightPart";
import { TopRightPart } from "./TopRightPart";
import { SelectionContext } from "./SelectionContext";
import {
  clamp,
  PAGE_SIZE,
  useBodyVisibleAreaTop,
  useBodyVisibleColumnRange,
  useClientMidHeight,
  useClientMidWidth,
  useCols,
  useColumnGroups,
  useColumnRange,
  useHeadVisibleColumnRange,
  useLeftScrolledOutWidth,
  useProd,
  useRowIdxByKey,
  useRowModels,
  useScrollToCell,
  useSelectRows,
  useSum,
  useSumRangeWidth,
  useSumWidth,
  useVisibleColumnGroupRange,
  useVisibleRowRange,
} from "./tableHooks";
import { ColumnGroupProps } from "./ColumnGroup";
import { SizingContext } from "./SizingContext";

const withBaseName = makePrefixer("uitkTable");

export type ColumnSeparatorType = "regular" | "none" | "groupEdge";
export type ColumnGroupRowSeparatorType = "first" | "regular" | "last";
export type ColumnGroupColumnSeparatorType = "regular" | "none";

export interface TableProps {
  children: ReactNode;
  isZebra?: boolean;
  rowData: any[];
  rowKeyGetter: (row: any) => string;
  className?: string;
}

export interface Size {
  height: number;
  width: number;
}

export interface TableRowModel {
  key: string;
  index: number;
  data: any;
}

export interface TableColumnModel {
  index: number;
  separator: ColumnSeparatorType;
  data: TableColumnProps;
}

export interface TableColumnGroupModel {
  index: number;
  data: ColumnGroupProps;
  childrenIds: string[];
  rowSeparator: ColumnGroupRowSeparatorType;
  columnSeparator: ColumnGroupColumnSeparatorType;
  colSpan: number;
}

export const Table = (props: TableProps) => {
  const { rowData, isZebra, className, rowKeyGetter } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollableRef = useRef<HTMLDivElement>(null);
  const middleRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [scrollLeft, setScrollLeft] = useState<number>(0);
  const [scrollTop, setScrollTop] = useState<number>(0);

  const [leftColMap, setLeftColMap] = useState<Map<number, TableColumnProps>>(
    new Map()
  );
  const [rightColMap, setRightColMap] = useState<Map<number, TableColumnProps>>(
    new Map()
  );
  const [midColMap, setMidColMap] = useState<Map<number, TableColumnProps>>(
    new Map()
  );

  const leftColPs = useMemo(() => {
    const entries = [...leftColMap.entries()].filter(
      ([index, value]) => !!value
    );
    entries.sort((a, b) => a[0] - b[0]);
    return entries.map((x) => x[1]);
  }, [leftColMap]);

  const rightColPs = useMemo(() => {
    const entries = [...rightColMap.entries()].filter(
      ([index, value]) => !!value
    );
    entries.sort((a, b) => a[0] - b[0]);
    return entries.map((x) => x[1]);
  }, [rightColMap]);

  const midColPs = useMemo(() => {
    const entries = [...midColMap.entries()].filter(
      ([index, value]) => !!value
    );
    entries.sort((a, b) => a[0] - b[0]);
    return entries.map((x) => x[1]);
  }, [midColMap]);

  // const [leftColPs, setLeftColPs] = useState<TableColumnProps[]>([]);
  // const [rightColPs, setRightColPs] = useState<TableColumnProps[]>([]);
  // const [midColPs, setMidColPs] = useState<TableColumnProps[]>([]);

  const [leftGrpPs, setLeftGrpPs] = useState<ColumnGroupProps[]>([]);
  const [rightGrpPs, setRightGrpPs] = useState<ColumnGroupProps[]>([]);
  const [midGrpPs, setMidGrpPs] = useState<ColumnGroupProps[]>([]);

  const [hoverRowKey, setHoverRowKey] = useState<string | undefined>(undefined);

  const [clientWidth, setClientWidth] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [selRowKeys, setSelRowKeys] = useState<Set<string>>(new Set());
  const [lastSelRowKey, setLastSelRowKey] = useState<string | undefined>(
    undefined
  );
  const [rowHeight, setRowHeight] = useState<number>(0);

  const [cursorRowKey, setCursorRowKey] = useState<string | undefined>(
    undefined
  );
  const [cursorColKey, setCursorColKey] = useState<string | undefined>(
    undefined
  );

  const rowIdxByKey = useRowIdxByKey(rowKeyGetter, rowData);

  const leftGrps = useColumnGroups(leftGrpPs, 0);
  const midGrps = useColumnGroups(midGrpPs, leftGrps.length);
  const rightGrps = useColumnGroups(
    rightGrpPs,
    leftGrps.length + midGrps.length
  );

  const leftCols: TableColumnModel[] = useCols(leftColPs, 0, leftGrps);
  const midCols: TableColumnModel[] = useCols(
    midColPs,
    leftCols.length,
    midGrps
  );
  const rightCols: TableColumnModel[] = useCols(
    rightColPs,
    leftCols.length + midCols.length,
    rightGrps
  );

  const midColsById = useMemo(
    () => new Map<string, TableColumnModel>(midCols.map((c) => [c.data.id, c])),
    [midCols]
  );

  const leftWh = useSumWidth(leftCols);
  const midWidth = useSumWidth(midCols);
  const rightWh = useSumWidth(rightCols);
  const totalWh = useSum([leftWh, midWidth, rightWh]);

  const hasColumnGroups =
    leftGrps.length > 0 || midGrps.length > 0 || rightGrps.length > 0;

  const headRowCount = hasColumnGroups ? 2 : 1; // TODO multiple group levels
  const rowCount = rowData.length;
  const botRowCount = 0; // TODO
  const topHt = useProd([rowHeight, headRowCount]);
  const midHeight = useProd([rowHeight, rowCount]);
  const botHt = useProd([botRowCount, rowHeight]);
  const totalHt = useSum([topHt, midHeight, botHt]);
  const clientMidWidth = useClientMidWidth(clientWidth, leftWh, rightWh);

  const bodyVisColRng = useBodyVisibleColumnRange(
    midCols,
    scrollLeft,
    clientMidWidth
  );

  const midGrpByColId = useMemo(() => {
    const m = new Map<string, TableColumnGroupModel>();
    for (let g of midGrps) {
      for (let c of g.childrenIds) {
        m.set(c, g);
      }
    }
    return m;
  }, [midGrps]);

  const visColGrpRng = useVisibleColumnGroupRange(
    bodyVisColRng,
    midCols,
    midGrpByColId,
    leftGrps.length
  );

  const visColGrps = useMemo(() => {
    return midGrps.slice(visColGrpRng.start, visColGrpRng.end);
  }, [visColGrpRng, midGrps]);

  const headVisColRng = useHeadVisibleColumnRange(
    visColGrps,
    midColsById,
    leftCols.length
  );

  const bodyScrOutColWh = useLeftScrolledOutWidth(midCols, bodyVisColRng);
  const headScrOutColWh = useLeftScrolledOutWidth(midCols, headVisColRng);

  const bodyVisAreaLeft = useSum([leftWh, bodyScrOutColWh]);
  const headVisAreaLeft = useSum([leftWh, headScrOutColWh]);
  const clientMidHt = useClientMidHeight(clientHeight, topHt, botHt);
  const visRowRng = useVisibleRowRange(
    scrollTop,
    clientMidHt,
    rowHeight,
    rowCount
  );
  const bodyVisAreaTop = useBodyVisibleAreaTop(rowHeight, visRowRng, topHt);

  const bodyVisibleColumns = useColumnRange(midCols, bodyVisColRng);
  const headVisibleColumns = useColumnRange(midCols, headVisColRng);
  const bodyVisColWh = useSumRangeWidth(midCols, bodyVisColRng);

  const headVisColWh = bodyVisColWh; // TODO implement groups

  const style = useMemo(
    () =>
      ({
        ["--uitkTable-totalWidth"]: `${totalWh}px`,
        ["--uitkTable-totalHeight"]: `${totalHt}px`,
        ["--uitkTable-topHeight"]: `${topHt}px`,
        ["--uitkTable-leftWidth"]: `${leftWh}px`,
        ["--uitkTable-rightWidth"]: `${rightWh}px`,
        ["--uitkTable-bodyVisibleColumnWidth"]: `${bodyVisColWh}px`,
        ["--uitkTable-bodyVisibleAreaTop"]: `${bodyVisAreaTop}px`,
        ["--uitkTable-bodyVisibleAreaLeft"]: `${bodyVisAreaLeft}px`,
        ["--uitkTable-bottomHeight"]: `${botHt}px`,
        ["--uitkTable-headerVisibleColumnWidth"]: `${headVisColWh}px`,
        ["--uitkTable-headerVisibleAreaLeft"]: `${headVisAreaLeft}px`,
      } as any),
    [
      totalHt,
      totalWh,
      topHt,
      leftWh,
      rightWh,
      botHt,
      bodyVisColWh,
      bodyVisAreaLeft,
      bodyVisAreaTop,
      headVisColWh,
      headVisAreaLeft,
    ]
  );

  useEffect(() => {
    if (rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      if (rect.height !== clientHeight) {
        setClientHeight(rect.height);
      }
      if (rect.width !== clientWidth) {
        setClientWidth(rect.width);
      }
    }
  });

  const onWheel: WheelEventHandler<HTMLTableElement> = useCallback(
    ({ deltaX, deltaY }) => {
      const s = scrollableRef.current;
      if (s) {
        s.scrollLeft += deltaX;
        s.scrollTop += deltaY;
      }
    },
    [scrollableRef.current]
  );

  const onColumnAdded = useCallback(
    (columnProps: TableColumnProps) => {
      const { pinned = null } = columnProps;
      //const adder = (old: TableColumnProps[]) => [...old, columnProps];
      const adder = (old: Map<number, TableColumnProps>) => {
        const next = new Map(old);
        next.set(columnProps.index, columnProps);
        return next;
      };
      if (pinned === "left") {
        setLeftColMap(adder);
      } else if (pinned === "right") {
        setRightColMap(adder);
      } else {
        setMidColMap(adder);
      }
      console.log(`Column added: "${columnProps.name}"`);
    },
    [props.children]
  );

  const onColumnRemoved = useCallback((columnProps: TableColumnProps) => {
    // console.log(`Column removed: "${columnProps.name}"`);
    const { pinned } = columnProps;
    // const remover = (old: TableColumnProps[]) =>
    //   old.filter((x) => x.name !== columnProps.name);
    const remover = (old: Map<number, TableColumnProps>) => {
      const next = new Map(old);
      next.delete(columnProps.index);
      return next;
    };
    if (pinned === "left") {
      setLeftColMap(remover);
    } else if (pinned === "right") {
      setRightColMap(remover);
    } else {
      setMidColMap(remover);
    }
    console.log(`Column removed: "${columnProps.name}"`);
  }, []);

  const onColumnGroupAdded = useCallback((colGroupProps: ColumnGroupProps) => {
    const { pinned = null } = colGroupProps;
    const adder = (old: ColumnGroupProps[]) => [...old, colGroupProps];
    if (pinned === "left") {
      setLeftGrpPs(adder);
    } else if (pinned === "right") {
      setRightGrpPs(adder);
    } else {
      setMidGrpPs(adder);
    }
    console.log(`Group added: "${colGroupProps.name}"`);
  }, []);

  const onColumnGroupRemoved = useCallback(
    (colGroupProps: ColumnGroupProps) => {
      // console.log(`Group removed: "${colGroupProps.name}"`);
      const { pinned } = colGroupProps;
      const remover = (old: ColumnGroupProps[]) =>
        old.filter((x) => x.name !== colGroupProps.name);
      if (pinned === "left") {
        setLeftGrpPs(remover);
      } else if (pinned === "right") {
        setRightGrpPs(remover);
      } else {
        setMidGrpPs(remover);
      }
      console.log(`Group removed: "${colGroupProps.name}"`);
    },
    []
  );

  const cols = useMemo(
    () => [...leftCols, ...midCols, ...rightCols],
    [leftCols, midCols, rightCols]
  );

  const colIdxByKey = useMemo(
    () => new Map<string, number>(cols.map((c, i) => [c.data.id, c.index])),
    [cols]
  );

  const cursorColIdx =
    cursorColKey === undefined ? 0 : colIdxByKey.get(cursorColKey) || 0;
  const cursorRowIdx =
    cursorRowKey === undefined ? 0 : rowIdxByKey.get(cursorRowKey) || 0;

  const scrollToCell = useScrollToCell(
    visRowRng,
    setScrollTop,
    rowHeight,
    clientMidHt,
    midCols,
    bodyVisColRng,
    setScrollLeft,
    clientMidWidth
  );

  const moveCursor = useCallback(
    (rowIdx: number, colIdx: number) => {
      if (rowData.length < 1 || cols.length < 1) {
        return;
      }
      rowIdx = clamp(rowIdx, 0, rowData.length - 1);
      colIdx = clamp(colIdx, 0, cols.length - 1);
      setCursorRowKey(rowKeyGetter(rowData[rowIdx]));
      setCursorColKey(cols[colIdx].data.id);
      scrollToCell(rowIdx, colIdx);
      rootRef.current?.focus();
    },
    [
      setCursorRowKey,
      setCursorColKey,
      rowData,
      rowKeyGetter,
      cols,
      rootRef.current,
      scrollToCell,
    ]
  );

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      switch (event.key) {
        case "ArrowLeft":
          moveCursor(cursorRowIdx, cursorColIdx - 1);
          break;
        case "ArrowRight":
          moveCursor(cursorRowIdx, cursorColIdx + 1);
          break;
        case "ArrowUp":
          moveCursor(cursorRowIdx - 1, cursorColIdx);
          break;
        case "ArrowDown":
          moveCursor(cursorRowIdx + 1, cursorColIdx);
          break;
        case "PageUp":
          moveCursor(cursorRowIdx - PAGE_SIZE, cursorColIdx);
          break;
        case "PageDown":
          moveCursor(cursorRowIdx + PAGE_SIZE, cursorColIdx);
          break;
        case "Home":
          moveCursor(0, cursorColIdx);
          break;
        case "End":
          moveCursor(rowData.length - 1, cursorColIdx);
          break;
      }
    },
    [cursorRowIdx, cursorColIdx, moveCursor]
  );

  const rows = useRowModels(rowKeyGetter, rowData, visRowRng);

  const contextValue: TableContext = useMemo(
    () => ({
      onColumnAdded,
      onColumnRemoved,
      onColumnGroupAdded,
      onColumnGroupRemoved,
    }),
    [onColumnAdded, onColumnRemoved, onColumnGroupAdded, onColumnGroupRemoved]
  );

  const isLeftRaised = scrollLeft > 0;
  const isRightRaised = scrollLeft + clientMidWidth < midWidth;

  const selectRows = useSelectRows(
    lastSelRowKey,
    setSelRowKeys,
    setLastSelRowKey,
    rowData,
    rowIdxByKey,
    rowKeyGetter
  );

  const selCtValue: SelectionContext = useMemo(
    () => ({
      selRowKeys,
      selectRows,
      cursorRowKey,
      cursorColKey,
      moveCursor,
    }),
    [selRowKeys, selectRows, cursorRowKey, cursorColKey, moveCursor]
  );

  const resizeColumn = useCallback(
    (colIdx: number, width: number) => {
      const col = cols[colIdx];
      if (col.data.onWidthChanged) {
        col.data.onWidthChanged(width);
      }
    },
    [cols]
  );

  const sizingCtValue: SizingContext = useMemo(
    () => ({
      resizeColumn,
      rowHeight,
    }),
    [resizeColumn, rowHeight]
  );

  return (
    <TableContext.Provider value={contextValue}>
      {props.children}
      <SelectionContext.Provider value={selCtValue}>
        <SizingContext.Provider value={sizingCtValue}>
          <div
            className={cx(withBaseName(), {
              [withBaseName("zebra")]: isZebra,
              className,
            })}
            style={style}
            ref={rootRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            data-name={"grid-root"}
          >
            <CellMeasure setRowHeight={setRowHeight} />
            <Scrollable
              scrollLeft={scrollLeft}
              scrollTop={scrollTop}
              setScrollLeft={setScrollLeft}
              setScrollTop={setScrollTop}
              scrollerRef={scrollableRef}
              topRef={topRef}
              rightRef={rightRef}
              bottomRef={bottomRef}
              leftRef={leftRef}
              middleRef={middleRef}
            />
            <MiddlePart
              middleRef={middleRef}
              onWheel={onWheel}
              columns={bodyVisibleColumns}
              rows={rows}
              hoverOverRowKey={hoverRowKey}
              setHoverOverRowKey={setHoverRowKey}
            />
            <TopPart
              columns={headVisibleColumns}
              columnGroups={visColGrps}
              topRef={topRef}
              onWheel={onWheel}
            />
            <LeftPart
              leftRef={leftRef}
              onWheel={onWheel}
              columns={leftCols}
              rows={rows}
              isRaised={isLeftRaised}
              hoverOverRowKey={hoverRowKey}
              setHoverOverRowKey={setHoverRowKey}
            />
            <RightPart
              rightRef={rightRef}
              onWheel={onWheel}
              columns={rightCols}
              rows={rows}
              isRaised={isRightRaised}
              hoverOverRowKey={hoverRowKey}
              setHoverOverRowKey={setHoverRowKey}
            />
            <TopLeftPart
              onWheel={onWheel}
              columns={leftCols}
              columnGroups={leftGrps}
              isRaised={isLeftRaised}
            />
            <TopRightPart
              onWheel={onWheel}
              columns={rightCols}
              columnGroups={rightGrps}
              isRaised={isRightRaised}
            />
          </div>
        </SizingContext.Provider>
      </SelectionContext.Provider>
    </TableContext.Provider>
  );
};
