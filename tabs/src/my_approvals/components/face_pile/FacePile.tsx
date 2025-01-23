import * as React from 'react';
import { Facepile, OverflowButtonType, IFacepilePersona } from '@fluentui/react/lib/Facepile';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';

const styles = mergeStyleSets({
  container: {
    maxWidth: 300,
  },
  control: {
    paddingTop: 20,
  },
  slider: {
    margin: '10px 0',
  },
  dropdown: {
    paddingTop: 0,
    margin: '10px 0',
  },
});

const blankPersonas: IFacepilePersona[] = [
  { personaName: 'Person 1', imageInitials: 'P1', initialsColor: 1 },
  { personaName: 'Person 2', imageInitials: 'P2', initialsColor: 2 },
  { personaName: 'Person 3', imageInitials: 'P3', initialsColor: 3 },
  { personaName: 'Person 4', imageInitials: 'P4', initialsColor: 4 },
  { personaName: 'Person 5', imageInitials: 'P5', initialsColor: 5 },
  { personaName: 'Person 6', imageInitials: 'P6', initialsColor: 6 },
  { personaName: 'Person 7', imageInitials: 'P7', initialsColor: 7 },
  { personaName: 'Person 8', imageInitials: 'P8', initialsColor: 8 },
  { personaName: 'Person 9', imageInitials: 'P9', initialsColor: 9 },
  { personaName: 'Person 10', imageInitials: 'P10', initialsColor: 10 },
];

export const FacepileOverflowExample: React.FunctionComponent = () => {
  const overflowButtonProps = {
    ariaLabel: 'More users',
    onClick: (ev: React.MouseEvent<HTMLButtonElement>) => alert('overflow icon clicked'),
  };

  return (
    <div className={styles.container}>
      <Facepile
        personas={blankPersonas.slice(0, 10)}
        maxDisplayablePersonas={3}
        overflowButtonType={OverflowButtonType.descriptive}
        overflowButtonProps={overflowButtonProps}
        ariaDescription={'To move through the items use left and right arrow keys.'}
        ariaLabel={'Example list of Facepile personas'}
      />
    </div>
  );
};