// Import required dependencies
import { ReactNode } from "react";
import { ReplacementToken } from "./ReplacementToken";

// Import CSS for this component
import "./LineBlock.css";

// A component for the LineBlock cell. It returns a SVG line inside a div.
export const LineBlockCell = () => {
  return (
    <div className="LineBlock-cell">
      <svg viewBox="0 0 16 16" className="LineBlock-svg">
        <path d="M 0,8 L 16,8" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

// A component for the LineBlock code. It receives children as props and displays them in a <code> HTML element.
export const LineBlockCode = ({ children }: { children: ReactNode }) => {
  return <code className="DocGrid-code">{children}</code>;
};

// The main LineBlock component. 
// It receives several props including a token, optional lineWidth, lineStyle, replacementToken and a boolean hideToken.
// This component returns a SVG line, optional code and a ReplacementToken component if a replacementToken is provided.
export const LineBlock = ({
  token,
  lineWidth,
  lineStyle,
  replacementToken,
  hideToken,
}: {
  token: string;
  lineWidth?: string;
  lineStyle?: string;
  replacementToken?: string;
  hideToken?: boolean;
}) => {
  return (
    <>
      <div className="LineBlock-cell">
        <svg viewBox="0 0 16 16" className="LineBlock-svg">
          <path
            d="M 0,8 L 16,8"
            vectorEffect="non-scaling-stroke"
            strokeWidth={lineWidth ? `var(${lineWidth})` : "1px"} // set the line width if provided
            // set the line style based on the lineStyle prop
            stroke-dasharray={
              lineStyle === "dashed"
                ? "10,10"
                : lineStyle === "dotted"
                ? "3,3"
                : "0"
            }
          />
        </svg>
      </div>
      {/* Render the token if hideToken is not true */}
      {!hideToken && <code className="DocGrid-code">{token}</code>}
      {/* Render the ReplacementToken component if a replacementToken is provided */}
      {replacementToken && (
        <ReplacementToken replacementToken={replacementToken} />
      )}
    </>
  );
};

