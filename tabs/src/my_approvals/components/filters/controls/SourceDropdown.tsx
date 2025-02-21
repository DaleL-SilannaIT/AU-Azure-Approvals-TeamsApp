import React, { useEffect, useState } from 'react';
import { Dropdown, DropdownMenuItemType, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';
import axios from 'axios';
const endpoint = process.env.REACT_APP_API_FUNCTION_ENDPOINT || 'http://localhost:7071';
interface ISourceDropdownProps {
    sourceDropdownSelectedKeys: string[];
    setSourceDropdownSelectedKeys: (state: string[]) => void;
    userToken: string;
}

interface ISource {
    Parent_Approval_Sources_id: number;
    Parent_Approval_Sources_display_name: string;
    Parent_Approval_Sources_display_order: number;
    Child_Approval_Sources_id: number;
    Child_Approval_Sources_display_name: string;
    Child_Approval_Sources_url: string;
}

interface IGroupedSource {
    Parent_Approval_Sources_id: number;
    Child_Sources: ISource[];
}

const sourceDropdownStyles: Partial<IDropdownStyles> = { dropdown: { width: 300 } };

export const SourceDropdown: React.FunctionComponent<ISourceDropdownProps> = ({
    sourceDropdownSelectedKeys,
    setSourceDropdownSelectedKeys,
    userToken
}) => {
    const [sourceDropdownOptions, setSourceDropdownOptions] = useState<IDropdownOption[]>([]);

    useEffect(() => {
        const fetchApprovalSources = async () => {
            try {
                console.log(endpoint)
                const response = await fetch(`${endpoint}/api/approvalSources`, {
                    headers: {token: userToken}
                });
                const data = await response.json();
                const sources = data.map((source: ISource) => ({
                    key: source.Child_Approval_Sources_id,
                    text: source.Child_Approval_Sources_display_name
                }));
                setSourceDropdownOptions(sources);
            } catch (error) {
                console.error('Error fetching approval sources:', error);
            }
        };

        fetchApprovalSources();
    }, []);

    const onSourceDropdownChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
        if (option) {
            setSourceDropdownSelectedKeys(
                option.selected 
                    ? [...sourceDropdownSelectedKeys, option.key as string] 
                    : sourceDropdownSelectedKeys.filter(key => key !== option.key),
            );
        }
    };

    return (
        <Dropdown
            label="Approval Source"
            placeholder="Select source"
            selectedKeys={sourceDropdownSelectedKeys}
            multiSelect
            options={sourceDropdownOptions}
            styles={sourceDropdownStyles}
            onChange={onSourceDropdownChange}
        />
    );
};