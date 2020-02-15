/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, {
  MenuDataItem,
  BasicLayoutProps as ProLayoutProps,
  Settings,
} from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import Link from 'umi/link';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { Button, Icon, Breadcrumb } from 'antd';
// import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';
// import { getAuthorityFromRouter } from '@/utils/utils';
import { SysTitle } from '@/models/user';
import { ClickParam } from 'antd/lib/menu';
import styles from './BasicLayout.less';
import MenuLayout from './Menu';
import { KEYS, setToStorageByKey, getStorageByKey } from '@/utils/globalSession';

// const noMatch = (
//   <Result
//     status="403"
//     title="403"
//     subTitle="Sorry, you are not authorized to access this page."
//     extra={(<Button type="primary">
//       <Link to="/user/login">Go Login</Link>
//     </Button>
//     )}
//   />
// );

export interface BasicLayoutProps extends ProLayoutProps {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
  route: ProLayoutProps['route'] & {
    authority: string[];
  };
  settings: Settings;
  dispatch: Dispatch;
  menus: any[];
  sysTitle: SysTitle;
  breadcrumbname: string;
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
  breadcrumbNameMap: {
    [path: string]: MenuDataItem;
  };
};

let openKeys: string[] = [];

/**
 * 根据当前location 资源路径获取菜单中默认选中的key
 * @param menusdata 菜单资源
 * @param defaultPath 资源路径
 */
function getSelectedKeysByPath(menusdata: any[], defaultPath: string | undefined) {
  const seletedKeys: string[] = [];
  const parents: string[] = [];
  getKeys(menusdata, defaultPath, seletedKeys, parents);

  return {
    seletedKeys,
    openKeys,
  };
}


/**
 * 递归获取key
 * @param menusdata 资源菜单
 * @param defaultPath 资源路径
 * @param result 匹配的openKeys
 */
function getKeys(
  menusdata: any[],
  defaultPath: string | undefined,
  seletedKeys: string[],
  parents: string[]) {
  menusdata.forEach(item => {
    parents.push(item.name);
    if (item.resPath === defaultPath) {
      parents.pop();
      seletedKeys.push(item.name);
      openKeys = [...parents];
    }
    if (item.children && item.children.length > 0) {
      getKeys(item.children, defaultPath, seletedKeys, parents);
    }
    parents.pop();
  });
}

function isInMenu(code: string, menusdata: any[]): boolean {
  if (menusdata && menusdata.length > 0) {
    for (let i = 0; i < menusdata.length; i += 1) {
      const node = menusdata[i]
      if (node.resPath === code) {
        return true
      }
      if (node.children) {
        const kids = node.children;
        for (let j = 0; j < kids.length; j += 1) {
          const kid = kids[j]
          if (kid.resPath === code) {
            return true
          }
          const res = isInMenu(code, kid.children)
          if (res) {
            return true
          }
        }
      }
    }
  }
  return false
}

/**
 * use Authorized check all menu item
 */
// const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
//   menuList.map(item => {
//     const localItem = {
//       ...item,
//       children: item.children ? menuDataRender(item.children) : [],
//     };
//     return Authorized.check(item.authority, localItem, null) as MenuDataItem;
//   });

const BasicLayout: React.FC<any> = props => {
  const { dispatch,
          children,
          location = { pathname: '/', state: {} },
          menus,
          sysTitle,
          collapsed,
          // routePageSrcList,
          isFull,
          pageLocation,
        } = props;
  let { breadcrumbs } = props;

  let path = '';
  if (location.state) {
    const { resPath } = location && location.state
    path = resPath;
  }
  const openkeysResult = getSelectedKeysByPath(menus, path || '');
  breadcrumbs = breadcrumbs.length > 0 ? breadcrumbs : JSON.parse(getStorageByKey(KEYS.bread) || '{}')

  // 1、获取当前用户信息
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  }, []);

  // 2、获取菜单
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchMenu',
      });
    }
  }, []);

  // 获取系统列表
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchSysList',
      })
    }
  }, []);

  // 获取当前页面
  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchSysTitle',
      })
    }
  }, []);

  // useEffect(() => {
  //   if (dispatch) {
  //     dispatch({
  //       type: 'user/fetchButtons',
  //     })
  //   }
  // }, [])


  /**
   * init variables
   */
  const handleMenuCollapse = (): void => {
    // openkeysResult.openKeys = [];
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
      });
    }
  };

  // 框架系统执行返回功能
  const goBack = (): void => {
    window.history.back();
    // if (dispatch) {
    //   dispatch({
    //     type: 'global/saveRoutePageSrcList',
    //     payload: routePageSrcList.slice(0, routePageSrcList.length - 1),
    //   });
    // }
  }

  // get children authority
  // const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
  //   authority: undefined,
  // };

  const onclick = (param: ClickParam) => {
    const { keyPath } = param;
    const crumbs = keyPath.length > 0 ? [...keyPath].reverse() : []
    setToStorageByKey(KEYS.bread, JSON.stringify(crumbs))
    if (dispatch) {
      dispatch({
        type: 'global/saveBreadcrumbs',
        payload: crumbs,
      })
    }
  }

  return isFull ? <> {children} </> :
  // TODO <Link to="/"> 点击logo 跳转到首页
    <ProLayout
      contentStyle={{ margin: 0 }}
      className={styles.header}
      layout="topmenu"
      disableMobile
      title={sysTitle.sysName}
      logo={sysTitle.sysIcon}
      menuHeaderRender={(logoDom, titleDom) => <Link to="/">
        {logoDom}
        {titleDom}
      </Link>}
      rightContentRender={rightProps => <RightContent {...rightProps} />}>
      <div className={styles.content}>
        <div className={styles[collapsed ? 'content-left-fold' : 'content-left-unfold']}>
          {
            <MenuLayout
              menusdata={menus}
              collapsed={collapsed}
              defaultPath={location.pathname}
              defaultOpenKeys={collapsed ? [] : openkeysResult.openKeys}
              defaultSelectedKeys={openkeysResult.seletedKeys}
              onClick={onclick}
              mode="inline"
              theme="dark"
            />
          }
        </div>
        <div className={styles[collapsed ? 'content-right-unfold' : 'content-right-fold']}>
          <div className={styles.tips}>
            <Button type="link" onClick={handleMenuCollapse} className={styles.button}>
              <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} />
            </Button>
            <Breadcrumb className={styles.breadcrumb}>
              {
                breadcrumbs.length > 0 ?
                  breadcrumbs.map((item: string) =>
                    <Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>) : null
              }
            </Breadcrumb>
            {!isInMenu(`${pageLocation.split('?')[0].substring(1)}`, menus) && <Button type="link" onClick={goBack} className={styles.button}>
                返回上一页
            </Button>}
          </div>
          <div className={styles.content}>
            {/* <Authorized authority={authorized!.authority} noMatch={noMatch}> */}
            {children}
            {/* </Authorized> */}
          </div>
        </div>
      </div>
    </ProLayout>
};

export default connect(({ global, user }: ConnectState) => ({
  collapsed: global.collapsed,
  breadcrumbs: global.breadcrumbs,
  routePageSrcList: global.routePageSrcList,
  menus: user.menus,
  sysTitle: user.sysTitle,
  isFull: global.isFull,
  pageLocation: global.pageLocation,
}))(BasicLayout);
