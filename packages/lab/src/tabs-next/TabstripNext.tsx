import { makePrefixer, useControlled, useId } from "@salt-ds/core";
import clsx from "clsx";
import {
  Children,
  cloneElement,
  isValidElement,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useComponentCssInjection } from "@salt-ds/styles";
import { useWindow } from "@salt-ds/window";
import { TabNext } from "./TabNext";
import { TabElement, TabProps } from "../tabs/TabsTypes";
import { OverflowMenu } from "./OverflowMenu";
import tabstripCss from "./TabstripNext.css";

const noop = () => undefined;

const withBaseName = makePrefixer("saltTabstripNext");

function isTab(child: ReactNode | TabElement): child is TabElement {
  return isValidElement(child) && child.type === TabNext;
}

export type TabstripNextProps = PropsWithChildren<{
  activeTabIndex?: number | null;
  onActiveChange?: (index?: number) => void;
  defaultActiveTabIndex?: number;
  align?: "center";
  /* Triggered when tabs should be reordered to make the overflowed tab visible. This prop can only be used with controlled tabstrip. */
  onMoveTab?: (from: number, to: number) => void;
  /* Set a tab max-width in order to enable tab truncation */
  tabMaxWidth?: number;
  variant?: "primary" | "secondary";
  getTabId?: (index?: number) => string;
}>;

export const TabstripNext = ({
  children,
  activeTabIndex: activeTabIndexProp,
  defaultActiveTabIndex,
  onActiveChange,
  align,
  onMoveTab,
  tabMaxWidth,
  getTabId: getTabIdProp,
  variant = "primary",
}: TabstripNextProps) => {
  const targetWindow = useWindow();
  useComponentCssInjection({
    testId: "salt-tabstrip-next",
    css: tabstripCss,
    window: targetWindow,
  });
  const tabs = Children.toArray(children).filter(isTab);
  const uniqueId = useId();
  const _getTabId = useCallback(
    (index?: number) => {
      return `tab-${uniqueId ?? "unknown"}-${index ?? ""}`;
    },
    [uniqueId]
  );
  const getTabId = getTabIdProp || _getTabId;

  const [activeTabIndex, setActiveTabIndex] = useControlled({
    controlled: activeTabIndexProp,
    default: defaultActiveTabIndex,
    name: "useTabs",
    state: "activeTabIndex",
  });
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [overflowTabsLength, setOverflowTabsLength] = useState(0);
  const [keyboardFocusedIndex, setKeyboardFocusedIndex] = useState(-1);

  // figure out if overflow menu is necessary
  useEffect(() => {
    if (!outerRef.current || !innerRef.current) return;
    const resize = new ResizeObserver(() => {
      // we don't use resize observer results because they come in random order and we have refs anyways
      if (!outerRef.current || !innerRef.current) return;
      const hasOverflowingContent =
        innerRef.current.clientHeight - outerRef.current.clientHeight > 0;
      setHasOverflow(hasOverflowingContent);
      const tabsTopOffset = innerRef.current.getBoundingClientRect().top;
      const tabElements = [
        ...outerRef.current.querySelectorAll(
          `.${withBaseName("inner")} > [role="tab"]`
        ),
      ];
      const overflowLength = tabElements.filter((el) => {
        return el.getBoundingClientRect().top - tabsTopOffset > 0;
      }).length;
      setOverflowTabsLength(overflowLength);
    });
    resize.observe(outerRef.current);
    resize.observe(innerRef.current);
    const tabElements = outerRef.current.querySelectorAll<HTMLDivElement>(
      `.${withBaseName("inner")} > [role="tab]`
    );
    const lastTab = tabElements[tabElements.length - 1];
    if (lastTab) {
      resize.observe(lastTab);
    }

    return () => {
      resize.disconnect();
    };
  }, [tabs.length]);

  return (
    <div
      role="tablist"
      className={clsx(
        withBaseName(),
        withBaseName("horizontal"),
        [withBaseName(`variant-${variant}`)],
        {
          [withBaseName("centered")]: align === "center",
        }
      )}
      ref={outerRef}
    >
      <div className={withBaseName("inner")} ref={innerRef}>
        {tabs.map((child, index) => {
          const label =
            typeof child.props.children === "string"
              ? child.props.children
              : child.props.label;

          const isActive = activeTabIndex === index;
          const id = getTabId(index);
          const isOverflowed = index >= tabs.length - overflowTabsLength;
          return cloneElement<TabProps>(child, {
            id: id,
            style: {
              maxWidth: tabMaxWidth,
              visibility: isOverflowed ? "hidden" : undefined,
            },
            label,
            "aria-hidden": isOverflowed,
            tabIndex: isActive && !isOverflowed ? 0 : -1,
            selected: isActive,
            index,
            onClick: () => {
              setActiveTabIndex(index);
              onActiveChange?.(index);
            },
            onKeyUp: noop,
            onKeyDown: (e) => {
              let nextId;
              if (e.key === "ArrowRight") {
                const nextIsOverflowed =
                  index + 1 >= tabs.length - overflowTabsLength;
                if (nextIsOverflowed) {
                  outerRef?.current
                    ?.querySelector<HTMLDivElement>(
                      `.${withBaseName("overflowMenu")} .saltButton`
                    )
                    ?.focus();
                  return;
                } else {
                  nextId = getTabId(index + 1);
                  setKeyboardFocusedIndex(index + 1);
                }
              }
              if (e.key === "ArrowLeft") {
                nextId = getTabId(index - 1);
                setKeyboardFocusedIndex(index - 1);
              }
              if (nextId && innerRef.current) {
                (document.getElementById(nextId) as HTMLDivElement)?.focus();
              }
              if (e.key === "Enter" || e.key === " ") {
                const nextIndex =
                  keyboardFocusedIndex < 0
                    ? activeTabIndex
                    : keyboardFocusedIndex;
                setActiveTabIndex(nextIndex);
                onActiveChange?.(nextIndex as number);
              }
            },
          });
        })}
      </div>

      {hasOverflow ? (
        <OverflowMenu
          tabs={tabs}
          activeTabIndex={activeTabIndex}
          overflowTabsLength={overflowTabsLength}
          onMoveTab={onMoveTab}
          onSelectIndex={(index: number) => {
            onActiveChange?.(index);
            setActiveTabIndex(index);
          }}
          getTabId={getTabId}
          setKeyboardFocusedIndex={setKeyboardFocusedIndex}
        />
      ) : null}
    </div>
  );
};
