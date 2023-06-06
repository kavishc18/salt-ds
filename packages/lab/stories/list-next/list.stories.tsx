import { ComponentMeta, Story } from "@storybook/react";
import { ListNext, ListItemNext, ListNextProps, useList } from "../../src";
import { Button, FlexItem, FlexLayout } from "@salt-ds/core";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@salt-ds/icons";

export default {
  title: "Lab/List Next",
  component: ListNext,
} as ComponentMeta<typeof ListNext>;

const simpleListExample = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
];

const getListItems = ({
  disabledItems = [],
  selectedItems = [],
}: {
  disabledItems?: number[];
  selectedItems?: number[];
}) =>
  simpleListExample.map((item, index) => {
    return (
      <ListItemNext
        key={index}
        disabled={disabledItems.includes(index)}
        selected={selectedItems?.includes(index)}
        value={item}
      >
        {item}
      </ListItemNext>
    );
  });

export const Default: Story<ListNextProps> = ({ children, ...rest }) => {
  return (
    <ListNext {...rest} aria-label="Declarative List example">
      {children ||
        getListItems({
          disabledItems: [1, 5],
        })}
    </ListNext>
  );
};

Default.args = {
  style: { width: "200px" },
};

export const Borderless = Default.bind({});
Borderless.args = {
  borderless: true,
};

export const ConfigurableHeight = Default.bind({});
ConfigurableHeight.args = {
  displayedItemCount: 6,
};

export const Deselectable = Default.bind({});
Deselectable.args = {
  deselectable: true,
};

export const Disabled = Default.bind({});
Disabled.args = {
  disabled: true,
};

export const DisabledSelected = Default.bind({});
DisabledSelected.args = {
  children: getListItems({
    disabledItems: [1],
    selectedItems: [1],
  }),
};

export const Empty: Story<ListNextProps> = ({ children, ...rest }) => {
  return (
    <FlexLayout>
      <FlexItem>
        <p>Default message</p>
        <ListNext aria-label="Empty List default example" />
      </FlexItem>
      <FlexItem>
        <p>Custom message</p>
        <ListNext {...rest} aria-label="Empty List custom message example" />
      </FlexItem>
    </FlexLayout>
  );
};

Empty.args = {
  emptyMessage: "List is empty",
};

export const Controlled: Story<ListNextProps> = ({ chidlren, ...rest }) => {
  const downButtonRef = useRef(null);
  const upButtonRef = useRef(null);

  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [selectedItem, setSelectedItem] = useState(null);

  // const {
  //   listRef,
  //   focusedIndex,
  //   selectedIndexes,
  //   activeDescendant,
  //   handleClick,
  // } = useList({ children, onFocus, onKeyDown, onBlur, onMouseDown });

  // add refs to each btton, pass these refs into list (which handles it in the hook) and control it through the hook.
  useEffect(() => {
    if (selectedItem) {
      console.log("selection changed", selectedItem);
    }
  }, [selectedItem]);

  const handleArrowDown = () => {
    console.log("storybook handleArrowDown");
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.min(simpleListExample.length - 1, prevHighlightedIndex + 1)
    );
  };

  const handleArrowUp = () => {
    console.log("handleArrowUp");
    setHighlightedIndex((prevHighlightedIndex) =>
      Math.max(0, prevHighlightedIndex - 1)
    );
  };

  const handleSelect = () => {
    console.log("handleSelect");
    setSelectedItem(simpleListExample[highlightedIndex] || null);
  };

  return (
    <div style={{ flexDirection: "column" }}>
      <div style={{ display: "flex" }}>
        <Button
          disabled={highlightedIndex === simpleListExample.length - 1}
          // move focus handler into list
          onClick={handleArrowDown}
          aria-label="Move down"
          ref={downButtonRef}
        >
          <ChevronDownIcon aria-hidden />
        </Button>
        <Button
          disabled={highlightedIndex <= 0}
          // move focus handler into list
          onClick={handleArrowUp}
          aria-label="Move up"
          ref={upButtonRef}
        >
          <ChevronUpIcon aria-hidden />
        </Button>
        {/* select handler goes into list */}
        <Button
          onClick={handleSelect}
          // ref={selectButtonRef
        >
          Select
        </Button>
      </div>
      <div style={{ height: "250px" }}>
        <ListNext
          aria-label="Controlled List example"
          onKeyDown={() => null}
          onMouseDown={() => null}
          onFocus={() => null}
          onBlur={() => null}
          downButtonRef={downButtonRef}
          upButtonRef={upButtonRef}
          // highlightedIndex={highlightedIndex}
          // selectedItem={selectedItem}
        >
          <ListItemNext value={simpleListExample[0]}>
            {simpleListExample[0]}
          </ListItemNext>
          <ListItemNext value={simpleListExample[1]}>
            {simpleListExample[1]}
          </ListItemNext>
          <ListItemNext value={simpleListExample[2]}>
            {simpleListExample[2]}
          </ListItemNext>
          <ListItemNext value={simpleListExample[3]} disabled>
            {simpleListExample[3]}
          </ListItemNext>
          <ListItemNext value={simpleListExample[4]}>
            {simpleListExample[4]}
          </ListItemNext>
          <ListItemNext value={simpleListExample[5]}>
            {simpleListExample[5]}
          </ListItemNext>
          <ListItemNext value={simpleListExample[6]}>
            {simpleListExample[6]}
          </ListItemNext>
          <ListItemNext value={simpleListExample[7]}>
            {simpleListExample[7]}
          </ListItemNext>
          <ListItemNext value={simpleListExample[8]}>
            {simpleListExample[8]}
          </ListItemNext>
          <ListItemNext value={simpleListExample[9]}>
            {simpleListExample[9]}
          </ListItemNext>
        </ListNext>
      </div>
    </div>
  );
};

//
// const CustomItemComponent = ({item}) => {
//   return <div>{item}
//   </div>
// }
// const customItems = simpleListExample.map((item, index) => {
//   return <CustomItemComponent item={item}/>;
// });
//
// export const CustomListItem = Default.bind({});
// CustomListItem.args = {
//   children: customItems,
// };
