import React, { useEffect, useState } from 'react';
import { Dropdown, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';
import { IRequester, IRequestersDropdownProps } from '../../../services/Interfaces';


export const RequestersDropdown: React.FunctionComponent<IRequestersDropdownProps> = ({
    requesterSelectedKeys,
    setRequesterSelectedKeys,
    requesters
}) => {
    const [requesterDropdownOptions, setRequesterDropdownOptions] = useState<IDropdownOption[]>([]);

    useEffect(() => {
        console.log('Requesters in RequestersDropdown:', requesters);
        const options = requesters.map((requester: IRequester) => ({
            key: requester.object_id,
            text: requester.display_name
        }));

        setRequesterDropdownOptions(options);
    }, [requesters]);

    const onRequesterDropdownChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
        if (option) {
            setRequesterSelectedKeys(
                option.selected 
                    ? [...requesterSelectedKeys, option.key as string] 
                    : requesterSelectedKeys.filter(key => key !== option.key),
            );
        }
    };

    return (
        <Dropdown
            label="Requesters"
            placeholder="Select user"
            selectedKeys={requesterSelectedKeys}
            multiSelect
            options={requesterDropdownOptions}
            onChange={onRequesterDropdownChange}
        />
    );
};