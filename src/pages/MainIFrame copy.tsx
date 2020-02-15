import React, { useEffect } from 'react';
import { ConnectState } from '@/models/connect';
import { connect } from 'dva';
import NoFoundPage from './404';
import { LoginOut } from '@/models/login';
import { getStorageByKey, KEYS } from '@/utils/globalSession';

const MainIFrame: React.FC<{}> = (props: any) => {
  const { dispatch, location, routePageSrcList } = props;

  let path = '';
  let isFull = false;
  if (location && location.state) {
    const { resPath, isFullScreen } = location.state
    path = resPath;
    isFull = isFullScreen
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
      const src = `${e.data.res}?token=${getStorageByKey(KEYS.token)}${paramsUrl}&&showHeader=false`
      dispatch({
        type: 'global/saveRoutePageSrcList',
        payload: [...routePageSrcList, src],
      })
    }

    if (e && e.data && e.data.type === LoginOut.flag) {
      // 登出时同时将当前页面位置保存至缓存中,登录后能回到该页面
      // setToStorageByKey(KEYS.location, JSON.stringify(props.location.state || ''))
      // router.push('/user/login')
      if (dispatch) {
        dispatch({
          type: 'login/logout',
          payload: location.state,
        });
      }
    }
  }

  useEffect(() => {
    // 添加子页面中 事件触发页面跳转监听
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
    }
  })

  useEffect(() => {
    dispatch({
      type: 'global/saveRoutePageSrcList',
      payload: [`${path}?token=${getStorageByKey(KEYS.token)}&&showHeader=false`],
    })
  }, [path])

  useEffect(() => {
    dispatch({
      type: 'global/saveFull',
      payload: isFull,
    })
  }, [isFull])

  return path ? <>
    {
      routePageSrcList.map((src: string, idx: number) =>
        <div key={src} style={{ height: isFull ? '100vh' : 'calc(100vh - 130px)', zIndex: idx, display: `${idx === (routePageSrcList.length - 1) ? '' : 'none'}` }}>
          <iframe id="iframe" title="page" style={{ border: 0, width: '100%', height: '100%', overflow: 'hidden' }}
            src={src}></iframe>
        </div>,
      )
    }
  </> : <NoFoundPage />
}

export default connect(({ user, global }: ConnectState) => ({
  sysList: user.sysList,
  routePageSrcList: global.routePageSrcList,
  isFull: global.isFull,
}))(MainIFrame);
