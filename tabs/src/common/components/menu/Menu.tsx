import React, { useState } from 'react';
import { Nav, INavStyles, INavLinkGroup, INavLink } from '@fluentui/react/lib/Nav';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { IconButton } from '@fluentui/react/lib/Button';

// Initialize icons
initializeIcons();

const navStyles: Partial<INavStyles> = {
  root: {
    width: 208,
    height: 350,
    boxSizing: 'border-box',
    border: '1px solid #eee',
    overflowY: 'auto',
  },
  // these link styles override the default truncation behavior
  link: {
    whiteSpace: 'normal',
    lineHeight: 'inherit',
  },
};

// adding an empty title string to each link removes the tooltip;
// it's unnecessary now that the text wraps, and will not truncate
const navLinkGroups: INavLinkGroup[] = [
  {
    links: [
      {
        name: 'New Approval',
        url: '#/tab/new_approval',
        title: '',
        key: 'newApproval',
        iconProps: { iconName: 'Add' }
      },
      {
        name: 'My Approvals',
        url: '#/tab/my_approvals',
        key: 'myApprovals',
        title: '',
        iconProps: { iconName: 'CheckMark' }
      },
      {
        name: 'Past Approvals',
        url: '#/tab/past_approvals',
        key: 'pastApprovals',
        title: '',
        iconProps: { iconName: 'History' }
      },
      {
        name: 'Admin',
        url: '#/tab/admin',
        key: 'admin',
        title: '',
        iconProps: { iconName: 'Admin' }
      }
    ],
  },
];

interface MenuProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export const Menu: React.FunctionComponent<MenuProps> = ({ isCollapsed, toggleCollapse }) => {
  const [selectedKey, setSelectedKey] = useState<string>('myApprovals');

  const onLinkClick = (ev?: React.MouseEvent<HTMLElement>, item?: INavLink) => {
    if (item && item.key) {
      setSelectedKey(item.key);
    }
  };

  const collapsedNavLinkGroups = navLinkGroups.map(group => ({
    ...group,
    links: group.links.map(link => ({
      ...link,
      name: isCollapsed ? '' : link.name,
    })),
  }));

  return (
    <div>
      <IconButton
        iconProps={{ iconName: isCollapsed ? 'ChevronRight' : 'ChevronLeft' }}
        title="Collapse menu"
        ariaLabel="Collapse menu"
        onClick={toggleCollapse}
      />
      <Nav
        groups={collapsedNavLinkGroups}
        selectedKey={selectedKey}
        onLinkClick={onLinkClick}
        styles={{
          ...navStyles,
          root: {
            height: 350,
            boxSizing: 'border-box',
            border: '1px solid #eee',
            overflowY: 'auto',
            width: isCollapsed ? 48 : 208,
            transition: 'width 0.3s',
          },
        }}
      />
    </div>
  );
};
