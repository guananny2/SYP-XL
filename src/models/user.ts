import { Effect } from 'dva';
import { Reducer } from 'redux';
import { message as msg } from 'antd';
import { setToStorageByKey } from '@/utils/globalSession';
import { queryCurrent,
         query as queryUsers,
         queryMenus, transformMenus,
         querySysList,
         querySysTitle,
         getCenterMenu,
         queryPermissionButtons as queryButtons,
        } from '@/services/user';

export interface CurrentUser {
  avatar?: string;
  name?: string;
  title?: string;
  group?: string;
  signature?: string;
  tags?: {
    key: string;
    label: string;
  }[];
  userId?: string;
  unreadCount?: number;
}

export interface SysMenuItem {
  children?: SysMenuItem[];
  className?: string;
  controlClassName?: string;
  id?: number;
  pRes?: any;
  pResId?: number;
  remark?: string;
  resFullName?: string;
  resId?: number;
  resName?: string;
  resPath?: string;
  resType?: number;
  showInMenu?: number;
  sort?: number;
  sysCode?: string;
  text?: string;
}

export interface SysItem {
  sysCode: string;
  sysName: string;
  sysURL: string;
  resURL: string;
  remark: string;
}

export interface SysTitle {
  comPic?: string;
  orgId?: number;
  sysIcon?: string;
  sysIconFileName?: string;
  sysId?: number;
  sysName?: string;
}

export interface UserModelState {
  currentUser?: CurrentUser;
  sysTitle?: SysTitle;
  menus?: SysMenuItem[];
  centerMenu?: SysMenuItem;
  sysList?: SysItem[];
  buttons?: [];
}

export interface UserModelType {
  namespace: 'user';
  state: UserModelState;
  effects: {
    fetch: Effect;
    fetchCurrent: Effect;
    fetchMenu: Effect;
    fetchSysList: Effect;
    fetchSysTitle: Effect;
    fetchButtons: Effect;
  };
  reducers: {
    saveCurrentUser: Reducer<UserModelState>;
    changeNotifyCount: Reducer<UserModelState>;
    saveMenu: Reducer<UserModelState>;
    saveCenterMenu: Reducer<UserModelState>;
    saveSysList: Reducer<UserModelState>;
    saveSysTitle: Reducer<UserModelState>;
  };
}

const UserModel: UserModelType = {
  namespace: 'user',

  state: {
    currentUser: {},
    sysTitle: {},
    menus: [],
    centerMenu: {},
    sysList: [],
    buttons: [],
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const { result, ok, message } = yield call(queryCurrent);
      if (!ok) {
        msg.error(message)
        return
      }
      yield put({
        type: 'saveCurrentUser',
        payload: result,
      });
    },
    *fetchMenu(_, { call, put }) {
      const { result, ok, message } = yield call(queryMenus);
      if (!ok) {
        msg.error(message)
        return
      }
      const menus1 = [
        {
          path: '/views',
          name: '总体监控预览',
          children: [],
          sysCode: 'ee',
          resPath: 'dashboard',
          icon: 'dashboard',
        },
      ]
      yield put({
        type: 'saveMenu',
        payload: [...transformMenus(result), ...menus1],
      });
      yield put({
        type: 'saveCenterMenu',
        payload: getCenterMenu(result),
      });
    },
    *fetchSysList(_, { call, put }) {
      const { result, ok, message } = yield call(querySysList);
      if (!ok) {
        msg.error(message)
        return
      }
      yield put({
        type: 'saveSysList',
        payload: result,
      })
    },
    *fetchSysTitle(_, { call, put }) {
      const { result, ok, message } = yield call(querySysTitle);
      if (!ok) {
        msg.error(message)
        return
      }
      yield put({
        type: 'saveSysTitle',
        payload: result,
      })
    },
    *fetchButtons(_, { call }) {
      const { result, ok, message } = yield call(queryButtons);
      if (!ok) {
        msg.error(message)
        return
      }
      setToStorageByKey('permission-button', JSON.stringify(result))
    },
  },

  reducers: {
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload || {},
      };
    },
    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
    saveMenu(state, action) {
      return {
        ...state,
        menus: action.payload || {},
      };
    },
    saveCenterMenu(state, action) {
      return {
        ...state,
        centerMenu: action.payload || {},
      };
    },
    saveSysList(state, action) {
      return {
        ...state,
        sysList: action.payload || {},
      };
    },
    saveSysTitle(state, action) {
      return {
        ...state,
        sysTitle: action.payload || {},
      };
    },
  },
};

export default UserModel;
