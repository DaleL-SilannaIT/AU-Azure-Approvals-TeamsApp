import { Dropdown, DropdownMenuItemType, IDropdownOption, IDropdownStyles } from '@fluentui/react/lib/Dropdown';

interface ISourceDropdownProps {
    sourceDropdownSelectedKeys: string[];
    setSourceDropdownSelectedKeys: (state: string[]) => void;
}

const sourceDropdownStyles: Partial<IDropdownStyles> = { dropdown: { width: 300 } };
const sourceDropdownOptions = [
    { key: 'fruitsHeader', text: 'Fruits', itemType: DropdownMenuItemType.Header },
    { key: 'apple', text: 'Apple' },
    { key: 'banana', text: 'Banana' },
    { key: 'orange', text: 'Orange', disabled: true },
    { key: 'grape', text: 'Grape' },
    { key: 'watermelon', text: 'Watermelon', hidden: true },
    { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
    { key: 'vegetablesHeader', text: 'Vegetables', itemType: DropdownMenuItemType.Header },
    { key: 'broccoli', text: 'Broccoli' },
    { key: 'carrot', text: 'Carrot' },
    { key: 'lettuce', text: 'Lettuce' },
];

export const SourceDropdown: React.FunctionComponent<ISourceDropdownProps> = ({
    sourceDropdownSelectedKeys,
    setSourceDropdownSelectedKeys
}) => {
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