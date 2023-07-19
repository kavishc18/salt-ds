import { FC, ReactNode, Fragment } from "react";

export interface KeyboardControlProps {
  children: ReactNode;
  keyOrCombos: string[];
  className?: string;
}

const comboSeparator = /\s*\+\s*/;

function splitCombo(keyOrCombo: string): string[] {
  return keyOrCombo.split(comboSeparator);
}

const KeyCombo: FC<{ keyOrCombo: string }> = ({ keyOrCombo }) => {
  return (
    <>
      {splitCombo(keyOrCombo).map((key, index) => {
        if (index > 0) {
          return (
            <Fragment key={index}>
              {" + "}
              <kbd>{key}</kbd>
            </Fragment>
          );
        }
        return <kbd key={index}>{key}</kbd>;
      })}
    </>
  );
};

export const KeyboardControl: FC<KeyboardControlProps> = ({
  children,
  keyOrCombos,
  className,
}) => {
  return (
    <tr className={className}>
      <td>
        {keyOrCombos.map((keyOrCombo, index) => {
          if (index > 0) {
            return (
              <Fragment key={index}>
                {" / "}
                <KeyCombo keyOrCombo={keyOrCombo} />
              </Fragment>
            );
          }
          return <KeyCombo key={index} keyOrCombo={keyOrCombo} />;
        })}
      </td>
      <td>{children}</td>
    </tr>
  );
};
