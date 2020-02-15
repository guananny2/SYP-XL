import React from 'react';
import { ConnectState } from '@/models/connect';
import { connect } from 'dva';
import { Result, Button } from 'antd';
import { router } from 'umi';

// 这里应该使用 antd 的 404 result 组件，
// 但是还没发布，先来个简单的。
const NoFoundPage: React.FC<{}> = () => <Result
  status="404"
  title="404"
  subTitle="Sorry, the page you visited does not exist."
  extra={<Button type="primary" onClick={() => router.push('/')}>Back Home</Button>}
></Result>

export default connect(({ user }: ConnectState) => ({
  sysList: user.sysList,
}))(NoFoundPage);
