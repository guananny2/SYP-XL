import React, { useState, useEffect } from 'react';
import { Icon, Menu } from 'antd';
import { connect } from 'dva';
import { ConnectState } from '@/models/connect';
import { Link } from 'umi';
import { SelectParam, ClickParam } from 'antd/lib/menu';
import { MenuMode } from 'antd/es/menu';
import { MenuTheme } from 'antd/es/menu/MenuContext';
import { Dispatch } from 'redux';

const { SubMenu } = Menu;

export interface MenuProps {
  menusdata: any[];
  collapsed: boolean;
  defaultPath: string;
  defaultSelectedKeys: string[];
  defaultOpenKeys: string[];
  mode: MenuMode;
  theme: MenuTheme;
  dispatch: Dispatch;
  onClick: (param: ClickParam) => void;
}

function renderMenu(menus: any[]) {
  return menus && menus.length > 0 && menus.map((item: any) => (
    item.children && item.children.length > 0 ?
      <SubMenu key={`${item.name}`} title={
        <span>
          <Icon type={item.icon} />
          <span>{item.name}</span>
        </span>
      }>
        {renderMenu(item.children)}
      </SubMenu> :
      <Menu.Item key={`${item.name}`}>
        <Link to={{ pathname: item.path,
                    state: {
                      sysCode: item.sysCode,
                      resPath: item.resPath,
                      isFullScreen: item.isFull,
                    },
                  }}>
          <Icon type={item.icon} />
          <span>{item.name}</span>
        </Link>
      </Menu.Item>
  ))
}

const MenuLayout: React.FC<MenuProps> = props => {
  const {
    menusdata,
    collapsed,
    defaultSelectedKeys,
    defaultOpenKeys,
    mode,
    theme,
    onClick,
  } = props;
  const [selected, setSelected] = useState<string[]>([]);
  const [opened, setOpened] = useState<string[]>([]);


  useEffect(() => {
    setSelected(defaultSelectedKeys);
    setOpened(defaultOpenKeys);
  }, [defaultSelectedKeys, defaultOpenKeys])

  const onSelect = (param: SelectParam) => {
    const { key, selectedKeys } = param
    if (!selectedKeys.includes(key)) {
      setSelected(selectedKeys);
    }
  }

  const onOpenChange = (openKeys: string[]) => {
    setOpened(openKeys);
  }

  return <div>
    <div>
      <Menu
        selectedKeys={selected}
        openKeys={opened}
        onSelect={onSelect}
        onOpenChange={onOpenChange}
        mode={mode}
        theme={theme}
        inlineCollapsed={collapsed}
        onClick={onClick}
      >
        {renderMenu(menusdata)}
      </Menu>
    </div>
  </div>
};

export default connect(({ global }: ConnectState) => ({
  collapsed: global.collapsed,
}))(MenuLayout)
