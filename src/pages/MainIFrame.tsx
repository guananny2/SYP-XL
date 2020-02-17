import React, { useEffect } from 'react';
import { ConnectState } from '@/models/connect';
import { connect } from 'dva';
import { LoginOut } from '@/models/login';
import { getStorageByKey, KEYS } from '@/utils/globalSession';
import { basePageProUrl, basePagedevUrl } from '../../config/pageUrlSettings'
import { isAntDesignProOrDev } from '@/utils/utils'

const MainIFrame: React.FC<{}> = (props: any) => {
  const { dispatch, location } = props;

  let path = 'dashboard';
  let isFull = false;
  if (location && location.state) {
    const { resPath, isFullScreen } = location.state
    if (resPath) {
      path = resPath;
    }
    if (isFullScreen) {
      isFull = isFullScreen
    }
  }

  const listener = (e: any) => {
    // 监听iframe页面中postMessage 执行页面跳转
    if (e && e.data && e.data.res) {
      // const { params } = e.data;
      dispatch({
        type: 'global/savePageLocation',
        payload: e.data.res,
      })
      // const src = `${e.data.res}?token=${getStorageByKey()}${paramsUrl}&&showHeader=false`
      // dispatch({
      //   type: 'global/saveRoutePageSrcList',
      //   payload: [...routePageSrcList, e.data.res],
      // })
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
  }

  useEffect(() => {
    // 添加子页面中 事件触发页面跳转监听
    window.addEventListener('message', listener)
    return () => {
      window.removeEventListener('message', listener)
    }
  })

  // useEffect(() => {
  //   dispatch({
  //     type: 'global/saveRoutePageSrcList',
  //     payload: [`${path}?token=${getStorageByKey(storageKeys.token)}&&showHeader=false`],
  //   })
  // }, [path])

  useEffect(() => {
    dispatch({
      type: 'global/saveFull',
      payload: isFull,
    })
  }, [isFull])

  return <iframe id="iframe" title="page" style={{ border: 0, width: '100%', height: '100%', overflow: 'hidden' }}
          src={`${isAntDesignProOrDev() ? basePagedevUrl : basePageProUrl}${path}?token=${getStorageByKey(KEYS.token)}&&showHeader=false`}></iframe>
}

export default connect(({ user, global }: ConnectState) => ({
  sysList: user.sysList,
  routePageSrcList: global.routePageSrcList,
  isFull: global.isFull,
}))(MainIFrame);
