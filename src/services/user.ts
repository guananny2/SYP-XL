import request from '@/utils/request';

export async function query(): Promise<any> {
  return request('/api/users');
}

export async function queryCurrent(params: any): Promise<any> {
  return request('/user/getUserByToken', {
    method: 'POST',
    data: params,
  });
}

export async function queryNotices(): Promise<any> {
  return request('/api/notices', { method: 'GET', prefix: '' });
}

export async function queryPermissionButtons(): Promise<any> {
  return request('/api/permissionButtons', { method: 'GET', prefix: '' });
}

export async function queryMenus(params: any): Promise<any> {
  return request('/user/getMenu', {
    method: 'POST',
    data: params,
  });
}

export function transformMenus(menus: any[]): any {
  const transformed: any[] = [];
  const leftMenu = menus && menus.filter(item => item.resName !== '个人中心');
  if (leftMenu) {
    leftMenu.forEach(item =>
      transformed.push({
        // path: `${item.rm.pathesPath} ` || `${index}`,
        path: item.path,
        name: item.resName,
        children: transformMenus(item.children),
        sysCode: item.sysCode,
        resPath: item.resPath,
        isFull: Boolean(item.controlClassName),
        icon: 'dashboard',
      }),
    );
  }
  return transformed;
}

export function getCenterMenu(menus: any[]): any {
  return menus.find(item => item.resName === '个人中心');
}

export async function querySysList(params: any): Promise<any> {
  return request('/user/getSysList', {
    method: 'POST',
    data: params,
  });
}

export async function querySysTitle(params: any): Promise<any> {
  return request('/user/getSysTitle', {
    method: 'POST',
    data: params,
  });
}
