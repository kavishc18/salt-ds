import { Button, ButtonProps, FlexLayout } from "@salt-ds/core";
import {
  DownloadIcon,
  SearchIcon,
  SendIcon,
  SettingsSolidIcon,
} from "@salt-ds/icons";
import { Meta, StoryFn } from "@storybook/react";

export default {
  title: "Core/Button",
  component: Button,
  // Manually specify onClick action to test Actions panel
  // react-docgen-typescript-loader doesn't support detecting interface extension
  // https://github.com/strothj/react-docgen-typescript-loader/issues/47
  argTypes: { onClick: { action: "clicked" } },
} as Meta<typeof Button>;

const SingleButtonTemplate: StoryFn<typeof Button> = (props) => {
  return <Button {...props} />;
};

const ButtonGrid = ({
  className = "",
  label,
  variant,
}: {
  className?: string;
  label: string;
  variant: ButtonProps["variant"];
}) => {
  const handleClick = () => {
    console.log("clicked");
  };

  const buttonLabel = `${label} Button`;
  return (
    <>
      <div
        className={className}
        style={{
          display: "grid",
          gridTemplateColumns: "auto auto auto",
          gridTemplateRows: "auto",
          gridGap: 10,
        }}
      >
        <Button variant={variant} onClick={handleClick}>
          {buttonLabel}
        </Button>
        <Button variant={variant} onClick={handleClick} aria-label="search">
          <SearchIcon aria-hidden />
        </Button>
        <Button variant={variant} onClick={handleClick}>
          <SearchIcon aria-hidden />
          {` ${buttonLabel}`}
        </Button>
      </div>
      <br />
      <div>
        <Button variant={variant} onClick={handleClick} disabled>
          {`${buttonLabel} (disabled)`}
        </Button>
      </div>
    </>
  );
};

export const All: StoryFn<typeof Button> = () => {
  const handleClick = () => {
    console.log("clicked");
  };

  return (
    <FlexLayout gap={1}>
      <Button variant={"cta"} onClick={handleClick}>
        CTA
      </Button>
      <Button variant={"primary"} onClick={handleClick}>
        Primary
      </Button>
      <Button variant={"secondary"} onClick={handleClick}>
        Secondary
      </Button>
    </FlexLayout>
  );
};

export const CTA: StoryFn<typeof Button> = () => {
  return <ButtonGrid variant="cta" label="CTA" />;
};

export const Primary: StoryFn<typeof Button> = () => {
  return <ButtonGrid variant="primary" label="Primary" />;
};

export const Secondary: StoryFn<typeof Button> = () => {
  return <ButtonGrid variant="secondary" label="Secondary" />;
};

export const FeatureButton = SingleButtonTemplate.bind({});
FeatureButton.args = {
  children: "Feature Button",
};

export const Disabled = SingleButtonTemplate.bind({});
Disabled.args = {
  disabled: true,
  children: "Disabled",
};

export const FocusableWhenDisabled = SingleButtonTemplate.bind({});
FocusableWhenDisabled.args = {
  focusableWhenDisabled: true,
  disabled: true,
  children: "Focusable When Disabled",
};

export const WithIcon: StoryFn<typeof Button> = () => {
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <Button variant="cta">
        Send <SendIcon aria-hidden />
      </Button>
      <Button variant="primary">
        <SearchIcon aria-hidden /> Search
      </Button>
      <Button variant="secondary">
        Setting <SettingsSolidIcon aria-hidden />
      </Button>
      <Button aria-label="download">
        <DownloadIcon aria-hidden />
      </Button>
    </div>
  );
};
