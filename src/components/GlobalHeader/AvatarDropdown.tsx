import { Avatar, Icon, Menu, Spin } from 'antd';
import { ClickParam } from 'antd/es/menu';
import { FormattedMessage } from 'umi-plugin-react/locale';
import React from 'react';
import { connect } from 'dva';
import router from 'umi/router';

import { ConnectState } from '@/models/connect';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import { LoginOut } from '@/models/login';

const AvatarDropdown: React.FC<any> = props => {
  // class AvatarDropdown extends React.Component<GlobalHeaderRightProps> {
  const onMenuClick = (event: ClickParam) => {
    const { center } = props;
    const { key } = event;
    if (key === LoginOut.flag) {
      const { dispatch, location } = props;
      if (dispatch) {
        dispatch({
          type: 'login/logout',
          payload: location.state,
        });
      }
      return;
    }

    router.push({ pathname: `${key}`, state: { sysCode: center.sysCode } });
  };

  const { currentUser = { avatar: '', name: '' } } = props;

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      {/* {menu && (
        <Menu.Item key={center.resPath}>
          <Icon type="user" />
          {center.name}
        </Menu.Item>
      )} */}
      {/* {menu && <Menu.Divider />} */}
      <Menu.Item key="logout">
        <Icon type="logout" />
        <FormattedMessage id="menu.account.logout" defaultMessage="logout" />
      </Menu.Item>
    </Menu>
  );

  return currentUser && currentUser.name ? (
    <HeaderDropdown overlay={menuHeaderDropdown}>
      <span className={`${styles.action} ${styles.account}`}>
        <Avatar size="small" className={styles.avatar} src={currentUser.avatar} alt="avatar" />
        <span className={styles.name}>{currentUser.name}</span>
      </span>
    </HeaderDropdown>
  ) : (
      <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
    );
}
export default connect(({ user, routing }: ConnectState) => ({
  location: routing.location,
  currentUser: user.currentUser,
  menu: user.menus,
  center: user.centerMenu,
}))(AvatarDropdown);
