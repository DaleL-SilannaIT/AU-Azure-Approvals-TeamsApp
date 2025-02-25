import React, { useEffect, useState } from 'react';
import { Dropdown, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';
import { IApprover, IApproversDropdownProps } from '../../../services/Interfaces';


export const ApproversDropdown: React.FunctionComponent<IApproversDropdownProps> = ({
    approversSelectedKeys,
    setApproversSelectedKeys,
    approvers
}) => {
    const [approversDropdownOptions, setApproversDropdownOptions] = useState<IDropdownOption[]>([]);

    useEffect(() => {
        console.log('Approvers in ApproversDropdown:', approvers);
        const options = approvers.map((approver: IApprover) => ({
            key: approver.object_id,
            text: approver.display_name
        }));

        setApproversDropdownOptions(options);
    }, [approvers]);

    const onApproversDropdownChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
        if (option) {
            setApproversSelectedKeys(
                option.selected
                    ? [...approversSelectedKeys, option.key as string]
                    : approversSelectedKeys.filter(key => key !== option.key),
            );
        }
    };

    return (
        <Dropdown
            label="Approvers"
            placeholder="Select user"
            selectedKeys={approversSelectedKeys}
            multiSelect
            options={approversDropdownOptions}
            onChange={onApproversDropdownChange}
        />
    );
};