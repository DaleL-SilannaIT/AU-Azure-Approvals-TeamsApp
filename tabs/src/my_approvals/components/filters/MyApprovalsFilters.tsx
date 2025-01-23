import * as React from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import { Panel } from '@fluentui/react/lib/Panel';
import { useBoolean } from '@fluentui/react-hooks';

export const MyApprovalsFilters: React.FunctionComponent = () => {
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);

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
        <p>Content goes here.</p>
      </Panel>
    </div>
  );
};