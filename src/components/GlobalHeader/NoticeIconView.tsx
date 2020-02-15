import React, { Component } from 'react';
import { Tag, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import Websocket from 'react-websocket';
import { NoticeItem } from '@/models/global';
import NoticeIcon from '../NoticeIcon';
import { CurrentUser } from '@/models/user';
import { ConnectProps, ConnectState } from '@/models/connect';
import styles from './index.less';

export interface GlobalHeaderRightProps extends ConnectProps {
  notices?: any[];
  currentUser?: CurrentUser;
  fetchingNotices?: boolean;
  onNoticeVisibleChange?: (visible: boolean) => void;
  onNoticeClear?: (tabName?: string) => void;
}

class GlobalHeaderRight extends Component<GlobalHeaderRightProps> {
  changeReadState = (clickedItem: NoticeItem): void => {
    const { title } = clickedItem;
    const { dispatch } = this.props;
    if (dispatch) {
      dispatch({
        type: 'global/changeNoticeReadState',
        payload: title,
      });
    }
  };

  handleNoticeClear = (title: string, key: string) => {
    const { dispatch } = this.props;
    message.success(`${formatMessage({ id: 'component.noticeIcon.cleared' })} ${title}`);
    if (dispatch) {
      dispatch({
        type: 'global/clearNotices',
        payload: key,
      });
    }
  };

  getNoticeData = (): NoticeItem[] => {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return [];
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });

    return newNotices;
  };

  handleData = (data: string) => {
    const { dispatch, notices } = this.props;

    if (dispatch) {
      dispatch({
        type: 'global/fetchNotices',
        payload: [{ title: data }, ...notices || []],
      });
    }
  }

  render() {
    const { currentUser, fetchingNotices, onNoticeVisibleChange } = this.props;
    const noticeData = this.getNoticeData();

    return (
      <>
        <Websocket url="ws://localhost:8080/ws"
          onMessage={this.handleData} />
        <NoticeIcon
          className={styles.action}
          count={currentUser && currentUser.unreadCount}
          onItemClick={item => {
            this.changeReadState(item as NoticeItem);
          }}
          loading={fetchingNotices}
          clearText={formatMessage({ id: 'component.noticeIcon.clear' })}
          viewMoreText={formatMessage({ id: 'component.noticeIcon.view-more' })}
          onClear={this.handleNoticeClear}
          onPopupVisibleChange={onNoticeVisibleChange}
          clearClose
        >
          <NoticeIcon.Tab
            tabKey="notification"
            list={noticeData}
            title=""
            emptyText="sssd"
          />
          {/* <NoticeIcon.Tab
            tabKey="message"
            count={unreadMsg.message}
            list={noticeData.message}
            title={formatMessage({ id: 'component.globalHeader.message' })}
            emptyText={formatMessage({ id: 'component.globalHeader.message.empty' })}
            showViewMore
          />
         */}
        </NoticeIcon>
      </>
    );
  }
}

export default connect(({ user, global, loading }: ConnectState) => ({
  currentUser: user.currentUser,
  collapsed: global.collapsed,
  fetchingMoreNotices: loading.effects['global/fetchMoreNotices'],
  fetchingNotices: loading.effects['global/fetchNotices'],
  notices: global.notices,
}))(GlobalHeaderRight);
