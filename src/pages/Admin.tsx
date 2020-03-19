import React, { useEffect } from 'react';
import { ConnectState } from '@/models/connect';
import { connect } from 'dva';
import NoFoundPage from './404';
import { LoginOut } from '@/models/login';
// import { getStorageByKey, KEYS } from '@/utils/globalSession';

// function getRealUrl(sysList: any[], sysCode: string) {
//   let url = '';
//   sysList.forEach(item => {
//     if (sysCode === item.sysCode) {
//       url = item.sysURL;
//     }
//   })
//   return url;
// }

const MainFrame: React.FC<{}> = (props: any) => {
  const { sysList, dispatch, location, routePageSrcList } = props;
  let code = '';
  let path = '';
  let isFull = false;
  if (location.state) {
    const { sysCode, resPath, isFullScreen } = location.state
    code = sysCode;
    path = resPath;
    isFull = isFullScreen;
  }

  const listener = (e: any) => {
    // 监听iframe页面中postMessage 执行页面跳转
    if (e && e.data && e.data.res) {
      const { params } = e.data;
      let paramsUrl = '';
      if (params) {
        const keys = Object.keys(params);
        keys.forEach((item: string) => {
          paramsUrl += `&${item}=${params[item]}`
        })
      }
      // const src1 = `${getRealUrl(sysList, e.data.sysCode)}/${e.data.res}?token=${getStorageByKey(KEYS.token)}${paramsUrl}`
      // console.log('src1', src1)
      const src = `http://www.xl-hby.com:28890/EP-Web/${e.data.res}?token=6490457316532224${paramsUrl}`
      dispatch({
        type: 'global/saveRoutePageSrcList',
        payload: [...routePageSrcList, src],
      })
    }

    if (e && e.data && e.data.sysCode === LoginOut.timeOut) {
      // 登出时同时将当前页面位置保存至缓存中,登录后能回到该页面
      if (dispatch) {
        dispatch({
          type: 'login/logout',
          payload: { ...location.state, page: 'admin' },
        });
      }
    }
  }

  useEffect(() => {
    dispatch({
      type: 'global/saveFull',
      payload: isFull,
    })
  }, [isFull])

  useEffect(() => {
    // 添加子页面中 事件f触发页面跳转监听
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
    }
  })

  useEffect(() => {
    dispatch({
      type: 'global/saveRoutePageSrcList',
      payload: [`http://www.xl-hby.com:28890/EP-Web/${path}?token=6490457316532224`],
      // payload: [`${getRealUrl(sysList, code)}/${path}?token=${getStorageByKey(KEYS.token)}`],
    })
  }, [sysList, path, code])

  return routePageSrcList.length > 0 ?
    <>
      {
        routePageSrcList.map((src: string, idx: number) =>
          <div style={{ height: isFull ? '100vh' : 'calc(100vh - 130px)', zIndex: idx, display: `${idx === (routePageSrcList.length - 1) ? '' : 'none'}` }}>
            <iframe title="page" style={{ border: 0, width: '100%', height: '100%', overflow: 'hidden' }}
              src={src} />
          </div>,
        )
      }
    </>
    : <NoFoundPage />
}

export default connect(({ global, user }: ConnectState) => ({
  sysList: user.sysList,
  routePageSrcList: global.routePageSrcList,
  isFull: global.isFull,
}))(MainFrame);
