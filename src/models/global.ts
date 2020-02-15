import { Reducer } from 'redux';
import { Subscription, Effect } from 'dva';

import { NoticeIconData } from '@/components/NoticeIcon';
import { ConnectState } from './connect.d';

export interface NoticeItem extends NoticeIconData {
  id: string;
  type: string;
  status: string;
}

export interface GlobalModelState {
  collapsed: boolean;
  notices: NoticeItem[];
  breadcrumbs?: any;
  routePageSrcList?: string[];
  isFull?: boolean; // 是否需全屏展示
  pageLocation?: string;
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalModelState;
  effects: {
    fetchNotices: Effect;
    clearNotices: Effect;
    changeNoticeReadState: Effect;
    setBreadcrumbs: Effect;
    setRoutePageSrcList: Effect;
  };
  reducers: {
    changeLayoutCollapsed: Reducer<GlobalModelState>;
    saveNotices: Reducer<GlobalModelState>;
    saveClearedNotices: Reducer<GlobalModelState>;
    saveBreadcrumbs: Reducer<GlobalModelState>;
    saveRoutePageSrcList: Reducer<GlobalModelState>;
    saveFull: Reducer<GlobalModelState>;
    savePageLocation: Reducer<GlobalModelState>;
  };
  subscriptions: { setup: Subscription };
}

const GlobalModel: GlobalModelType = {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    breadcrumbs: [],
    routePageSrcList: [],
    isFull: false,
    pageLocation: '',
  },

  effects: {
    *fetchNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveNotices',
        payload,
      });
      const unreadCount: number = yield select(
        (state: ConnectState) => state.global.notices.filter(item => !item.read).length,
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: payload.length,
          unreadCount,
        },
      });
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count: number = yield select((state: ConnectState) => state.global.notices.length);
      const unreadCount: number = yield select(
        (state: ConnectState) => state.global.notices.filter(item => !item.read).length,
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: count,
          unreadCount,
        },
      });
    },
    *changeNoticeReadState({ payload }, { put, select }) {
      const notices: NoticeItem[] = yield select((state: ConnectState) =>
        state.global.notices.map(item => {
          const notice = { ...item };
          if (notice.title === payload) {
            notice.read = true;
          }
          return notice;
        }),
      );

      yield put({
        type: 'saveNotices',
        payload: notices,
      });

      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: notices.length,
          unreadCount: notices.filter(item => !item.read).length,
        },
      });
    },
    *setBreadcrumbs({ payload }, { put }) {
      yield put({
        type: 'saveBreadcrumbs',
        payload,
      })
    },
    *setRoutePageSrcList({ payload }, { put }) {
      yield put({
        type: 'saveRoutePageSrcList',
        payload,
      })
    },
  },

  reducers: {
    changeLayoutCollapsed(state = { notices: [], collapsed: true }): GlobalModelState {
      return {
        ...state,
        collapsed: !state.collapsed,
      };
    },
    saveNotices(state, { payload }): GlobalModelState {
      return {
        collapsed: false,
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state = { notices: [], collapsed: true }, { payload }): GlobalModelState {
      return {
        collapsed: false,
        ...state,
        notices: state.notices.filter((item): boolean => item.type !== payload),
      };
    },
    saveBreadcrumbs(state, { payload }): GlobalModelState {
      return {
        ...state,
        collapsed: state?.collapsed || false,
        notices: state?.notices || [],
        breadcrumbs: payload,
      };
    },
    saveRoutePageSrcList(state, { payload }): GlobalModelState {
      return {
        ...state,
        collapsed: state?.collapsed || false,
        notices: state?.notices || [],
        routePageSrcList: payload,
      };
    },
    saveFull(state, { payload }) :GlobalModelState {
      return {
        ...state,
        collapsed: state?.collapsed || false,
        notices: state?.notices || [],
        isFull: payload,
      };
    },
    savePageLocation(state, { payload }) :GlobalModelState {
      return {
        ...state,
        collapsed: state?.collapsed || false,
        notices: state?.notices || [],
        pageLocation: payload,
      };
    },
  },

  subscriptions: {
    setup({ history }): void {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      history.listen(({ pathname, search }): void => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },

};

export default GlobalModel;
