import * as React from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import { Panel } from '@fluentui/react/lib/Panel';
import { useBoolean } from '@fluentui/react-hooks';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { defaultDatePickerStrings, mergeStyleSets, DatePicker as FluentDatePicker, SpinButton, ISpinButtonStyles, Position, DefaultButton } from '@fluentui/react';
import { onFormatDate, onParseDateFromString } from './controls/DatePicker';
import { useState } from 'react';

interface MyApprovalsFiltersProps {
  onApplyFilters: (filters: any) => void;
}

export const MyApprovalsFilters: React.FunctionComponent<MyApprovalsFiltersProps> = ({ onApplyFilters }) => {
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
  const [filters, setFilters] = useState({
    id: 0,
    fromDate: undefined as Date | undefined,
    toDate: undefined as Date | undefined,
    active: true,
  });

  const IdStyles: Partial<ISpinButtonStyles> = { spinButtonWrapper: { width: 75 } };

  const onApply = () => {
    onApplyFilters(filters);
    dismissPanel();
  };

  const styles = mergeStyleSets({
      root: { selectors: { '> *': { marginBottom: 15 } } },
      control: { maxWidth: 300, marginBottom: 15 },
  });

  return (
    <div>
      <IconButton
        iconProps={{ iconName: 'Filter' }}
        title="Open Filters"
        ariaLabel="Open Filters"
        onClick={openPanel}
      />
      <Panel
        headerText="Filters"
        isOpen={isOpen}
        onDismiss={dismissPanel}
        isLightDismiss
        closeButtonAriaLabel="Close"
      >
        <form>
          <div>
            <SpinButton
              label="Id"
              labelPosition={Position.top}
              defaultValue="0"
              min={0}
              max={100}
              step={1}
              incrementButtonAriaLabel="Increase value by 1"
              decrementButtonAriaLabel="Decrease value by 1"
              styles={IdStyles}
              onChange={(e, newValue) => setFilters({ ...filters, id: newValue ? parseInt(newValue, 10) : 0 })}
            />
          </div>
          <div>
            <div>
              <FluentDatePicker
                label="From"
                allowTextInput
                ariaLabel="Select a date. Input format is day slash month slash year."
                value={filters.fromDate || undefined}
                onSelectDate={(fromDate) => setFilters({ ...filters, fromDate: fromDate || undefined })}
                formatDate={onFormatDate}
                parseDateFromString={onParseDateFromString}
                className={styles.control}
                strings={defaultDatePickerStrings}
              />
              <FluentDatePicker
                label="To"
                allowTextInput
                ariaLabel="Select a date. Input format is day slash month slash year."
                value={filters.toDate || undefined}
                onSelectDate={(toDate) => setFilters({ ...filters, toDate: toDate || undefined })}
                formatDate={onFormatDate}
                parseDateFromString={onParseDateFromString}
                className={styles.control}
                strings={defaultDatePickerStrings}
              />
            </div>
            <div>
              <Toggle
                label="Active"
                defaultChecked
                onText="Yes"
                offText="No"
                onChange={(ev, checked = false) => setFilters({ ...filters, active: checked })}
              />
            </div>
          </div>
          <div>
            <DefaultButton text="Apply" onClick={onApply} />
          </div>
        </form>
      </Panel>
    </div>
  );
};