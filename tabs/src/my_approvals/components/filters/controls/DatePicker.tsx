import * as React from 'react';
import { DatePicker as FluentDatePicker, IDatePickerProps, mergeStyleSets, defaultDatePickerStrings, DefaultButton } from '@fluentui/react';
import { useState } from 'react';

const styles = mergeStyleSets({
    root: { selectors: { '> *': { marginBottom: 15 } } },
    control: { maxWidth: 300, marginBottom: 15 },
});

export const onFormatDate = (date?: Date): string => {
    return !date ? '' : date.getDate() + '/' + (date.getMonth() + 1) + '/' + (date.getFullYear() % 100);
};

export const onParseDateFromString = (dateStr: string): Date => {
    const dateParts = dateStr.trim().split('/');
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    let year = parseInt(dateParts[2], 10);
    if (year < 100) {
        year += new Date().getFullYear() - (new Date().getFullYear() % 100);
    }
    return new Date(year, month, day);
};

export const DatePicker: React.FunctionComponent<IDatePickerProps> = (props) => {
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  return (
    <div>
      <FluentDatePicker
        allowTextInput
        ariaLabel="Select a date. Input format is day slash month slash year."
        value={fromDate || undefined}
        onSelectDate={(date) => setFromDate(date || undefined)}
        formatDate={onFormatDate}
        parseDateFromString={onParseDateFromString}
      />
      <FluentDatePicker
        allowTextInput
        ariaLabel="Select a date. Input format is day slash month slash year."
        value={toDate || undefined}
        onSelectDate={(date) => setToDate(date || undefined)}
        formatDate={onFormatDate}
        parseDateFromString={onParseDateFromString}
      />
    </div>
  );
};

//export default DatePicker;
