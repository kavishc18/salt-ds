import {
  ComponentType,
  createContext,
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { FloatingPortal } from "@floating-ui/react";
import { UseFloatingUIProps } from "@salt-ds/core";

export interface PopperProps extends UseFloatingUIProps {
  /**
   * Option to not render the popper.
   */
  disabled: boolean;
}

export interface PopperContextType {
  Component: ComponentType<PropsWithChildren<PopperProps>>;
}

const PopperContext = createContext<PopperContextType>({
  Component: forwardRef((props, ref: ForwardedRef<HTMLDivElement>) => {
    const { open, disabled, ...rest } = props;
    return open && !disabled ? (
      <FloatingPortal>
        <div {...rest} ref={ref} />
      </FloatingPortal>
    ) : null;
  }),
});

if (process.env.NODE_ENV !== "production") {
  PopperContext.displayName = "PopperContext";
}

export interface PopperProviderProps extends PopperContextType {
  children: ReactNode;
}

export function PopperProvider(props: PopperProviderProps) {
  const { Component, children } = props;
  const value = useMemo(() => ({ Component }), [Component]);

  return (
    <PopperContext.Provider value={value}>{children}</PopperContext.Provider>
  );
}

export function usePopper() {
  return useContext(PopperContext);
}
