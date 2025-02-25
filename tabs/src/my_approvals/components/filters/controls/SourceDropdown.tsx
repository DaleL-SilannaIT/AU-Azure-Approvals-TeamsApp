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

export const SourceDropdown: React.FunctionComponent<ISourceDropdownProps> = ({
    sourceDropdownSelectedKeys,
    setSourceDropdownSelectedKeys,
    userToken
}) => {
    const [sourceDropdownOptions, setSourceDropdownOptions] = useState<IDropdownOption[]>([]);

    useEffect(() => {
        const fetchApprovalSources = async () => {
            try {
                const response = await axios.get(`${endpoint}/api/approvalSources`, {
                    headers: { token: userToken }
                });
                const data = response.data;

                const groupedSources = data.reduce((acc: any, source: ISource) => {
                    const parentId = source.Parent_Approval_Sources_id;
                    if (!acc[parentId]) {
                        acc[parentId] = {
                            key: `header_${parentId}`,
                            text: source.Parent_Approval_Sources_display_name,
                            itemType: DropdownMenuItemType.Header,
                            children: []
                        };
                    }
                    acc[parentId].children.push({
                        key: source.Child_Approval_Sources_id,
                        text: source.Child_Approval_Sources_display_name
                    });
                    return acc;
                }, {});

                const options: IDropdownOption[] = [];
                Object.values(groupedSources).forEach((group: any) => {
                    options.push(group);
                    options.push(...group.children);
                    options.push({ key: `divider_${group.key}`, text: '-', itemType: DropdownMenuItemType.Divider });
                });

                setSourceDropdownOptions(options);
            } catch (error) {
                console.error('Error fetching approval sources:', error);
            }
        };

        fetchApprovalSources();
    }, [userToken]);

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
            onChange={onSourceDropdownChange}
        />
    );
};