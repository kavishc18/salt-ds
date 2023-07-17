/**
 * **NOTE**
 *
 * This file has same title with the .mdx companion file.
 * Stories defined in this/that file may not be shown in the navigation tree after hot reloading.
 * Refresh of a page is needed.
 */

import { useState } from "react";
import { SaltProvider } from "@salt-ds/core";
import { Pill } from "@salt-ds/lab";
import { FavoriteIcon } from "@salt-ds/icons";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Lab/Pill",
  component: Pill,
} as ComponentMeta<typeof Pill>;

export const Default: ComponentStory<typeof Pill> = (args) => {
  return <Pill>Static Pill</Pill>;
};

export const ClosableStatic = () => {
  const [show, setShow] = useState(true);
  return show ? (
    <Pill onClose={() => setShow(false)}>Closable Static Pill</Pill>
  ) : null;
};

export const Clickable: ComponentStory<typeof Pill> = () => {
  const handleClick = () => {
    console.log("clicked");
  };
  return <Pill onClick={handleClick}>Clickable Pill</Pill>;
};

export const Disabled: ComponentStory<typeof Pill> = () => {
  return (
    <Pill disabled onClick={() => console.log("Click")}>
      Disabled Pill
    </Pill>
  );
};

export const ClosableClickable = () => {
  const [show, setShow] = useState(true);
  return show ? (
    <Pill onClick={() => console.log("clicked")} onClose={() => setShow(false)}>
      Closable Clickable Pill
    </Pill>
  ) : null;
};

export const DisabledClosable: ComponentStory<typeof Pill> = () => {
  return (
    <Pill disabled onClose={() => console.log("Deleted.")}>
      Disabled Closable Pill
    </Pill>
  );
};

export const Icon: ComponentStory<typeof Pill> = () => {
  return (
    <Pill icon={<FavoriteIcon />} onClick={() => console.log("Clicked.")}>
      Pill with Icon
    </Pill>
  );
};

const noop = () => undefined;
export const AllDensities: ComponentStory<typeof Pill> = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: " repeat(4, auto)",
        gap: 16,
      }}
    >
      <SaltProvider density="touch">
        <Pill icon={<FavoriteIcon />}>TD Pill</Pill>
      </SaltProvider>
      <SaltProvider density="low">
        <Pill icon={<FavoriteIcon />}>LD Pill</Pill>
      </SaltProvider>
      <SaltProvider density="medium">
        <Pill icon={<FavoriteIcon />}>MD Pill</Pill>
      </SaltProvider>
      <SaltProvider density="high">
        <Pill icon={<FavoriteIcon />}>HD Pill</Pill>
      </SaltProvider>

      <SaltProvider density="touch">
        <Pill icon={<FavoriteIcon />} onClick={noop} onClose={noop}>
          TD Pill
        </Pill>
      </SaltProvider>
      <SaltProvider density="low">
        <Pill icon={<FavoriteIcon />} onClick={noop} onClose={noop}>
          LD Pill
        </Pill>
      </SaltProvider>
      <SaltProvider density="medium">
        <Pill icon={<FavoriteIcon />} onClick={noop} onClose={noop}>
          MD Pill
        </Pill>
      </SaltProvider>
      <SaltProvider density="high">
        <Pill icon={<FavoriteIcon />} onClick={noop} onClose={noop}>
          HD Pill
        </Pill>
      </SaltProvider>
      <SaltProvider density="touch">
        <Pill icon={<FavoriteIcon />} onClose={noop}>
          TD Pill
        </Pill>
      </SaltProvider>
      <SaltProvider density="low">
        <Pill icon={<FavoriteIcon />} onClose={noop}>
          LD Pill
        </Pill>
      </SaltProvider>
      <SaltProvider density="medium">
        <Pill icon={<FavoriteIcon />} onClose={noop}>
          MD Pill
        </Pill>
      </SaltProvider>
      <SaltProvider density="high">
        <Pill icon={<FavoriteIcon />} onClose={noop}>
          HD Pill
        </Pill>
      </SaltProvider>
    </div>
  );
};
