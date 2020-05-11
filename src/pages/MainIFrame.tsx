import React, { useEffect } from 'react';
import { ConnectState } from '@/models/connect';
import { connect } from 'dva';
import { LoginOut } from '@/models/login';
import { getStorageByKey, KEYS } from '@/utils/globalSession';
import { basePageProUrl, basePagedevUrl } from '../../config/pageUrlSettings';
import { isAntDesignProOrDev } from '@/utils/utils';

const MainIFrame: React.FC<{}> = (props: any) => {
  const { dispatch, location, routePageSrcList } = props;

  let path = '';
  let isFull = false;
  if (location && location.state) {
    const { resPath, isFullScreen } = location.state;
    if (resPath) {
      path = resPath;
    }
    if (isFullScreen) {
      isFull = isFullScreen;
    }
  }

  const listener = (e: any) => {
    // 监听子项目中的 请求，如果单页面本身的跳转
    /**
     * 监听子项目中的通信
     * 1、单页面需跳转至已有服务器上的页面，新开一个iframe覆盖在原有的iframe上
     * 2、单页面本身的跳转，仅记录当前页面location
     */
    if (e && e.data && e.data.res) {
      if (e.data.SPAToOtherFrame) {
        const { params } = e.data;
        let paramsUrl = '';
        if (params) {
          const keys = Object.keys(params);
          keys.forEach((item: string) => {
            paramsUrl += `&${item}=${params[item]}`;
          });
        }
        const src = `http://www.xl-hby.com:28890/EP-Web/${e.data.res}?token=6490457316532224${paramsUrl}`;
        dispatch({
          type: 'global/saveRoutePageSrcList',
          payload: [...routePageSrcList, src],
        });
      } else {
        dispatch({
          type: 'global/savePageLocation',
          payload: e.data.res,
        });
      }
    }
    if (e && e.data && e.data.type === LoginOut.flag) {
      // 登出时同时将当前页面位置保存至缓存中,登录后能回到该页面
      // setGlobalToken(TOKENMAPPER.location, JSON.stringify(props.location.state || ''))
      // router.push('/user/login')
      if (dispatch) {
        dispatch({
          type: 'login/logout',
          payload: location.state,
        });
      }
    }
  };

  useEffect(() => {
    // 添加子页面中 事件触发页面跳转监听
    window.addEventListener('message', listener);
    return () => {
      window.removeEventListener('message', listener);
    };
  });

  useEffect(() => {
    dispatch({
      type: 'global/saveFull',
      payload: isFull,
    });
  }, [isFull]);

  return (
    <>
      <div
        style={{
          height: isFull ? '100vh' : 'calc(100vh - 130px)',
          zIndex: 0,
          display: `${routePageSrcList.length === 0 ? '' : 'none'}`,
        }}
      >
        <iframe
          id="iframe"
          title="page"
          style={{ border: 0, width: '100%', height: '100%', overflow: 'hidden' }}
          src={`${
            isAntDesignProOrDev() ? basePagedevUrl : basePageProUrl
          }${path}?token=${getStorageByKey(KEYS.token)}&showHeader=false`}
        />
      </div>
      {routePageSrcList.length > 0 &&
        routePageSrcList.map((src: string, idx: number) => (
          <div
            style={{
              height: isFull ? '100vh' : 'calc(100vh - 130px)',
              zIndex: idx + 1,
              display: `${idx === routePageSrcList.length - 1 ? '' : 'none'}`,
            }}
          >
            <iframe
              title="page"
              style={{ border: 0, width: '100%', height: '100%', overflow: 'hidden' }}
              src={src}
            />
          </div>
        ))}
    </>
  );
};

export default connect(({ user, global }: ConnectState) => ({
  sysList: user.sysList,
  routePageSrcList: global.routePageSrcList,
  isFull: global.isFull,
}))(MainIFrame);
