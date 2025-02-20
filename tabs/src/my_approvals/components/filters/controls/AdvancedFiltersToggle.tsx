import * as React from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Stack, IStackTokens } from '@fluentui/react/lib/Stack';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import { useId } from '@fluentui/react-hooks';

const stackTokens: IStackTokens = { childrenGap: 10 };

const buttonStyles = {
    root: {
        background: 'transparent',
        border: 'none',
        minWidth: '16px',
        padding: 0,
    },
};

interface IAdvancedFiltersToggleProps {
    advancedFilters: boolean;
    setAdvancedFilters: (checked: boolean) => void;
}

export const AdvancedFiltersToggle: React.FunctionComponent<IAdvancedFiltersToggleProps> = ({
    advancedFilters,
    setAdvancedFilters
}) => {
    const [showTooltip, setShowTooltip] = React.useState(false);
    const tooltipId = useId('tooltipId');

    const iconWithTooltip = (
        <>
            <TooltipHost content={showTooltip ? 'Enable advanced filters, overiding the default filter behaviour. This will allow you to control the logic used for the server side filtering (e.g. AND, OR)' : undefined} id={tooltipId}>
                <DefaultButton
                    aria-label={'More info'}
                    aria-describedby={showTooltip ? tooltipId : undefined}
                    onClick={() => setShowTooltip(!showTooltip)}
                    styles={buttonStyles}
                    iconProps={{ iconName: 'Info' }}
                />
            </TooltipHost>
        </>
    );

    return (
        <Toggle 
            label={<div>Advanced filters {iconWithTooltip}</div>} 
            onText="On" 
            offText="Off"
            checked={advancedFilters}
            onChange={(ev, checked) => setAdvancedFilters(checked ?? false)}
        />
    );
};
