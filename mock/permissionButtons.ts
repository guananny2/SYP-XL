import { Request, Response } from 'express';

const getButtons = (req: Request, res: Response) => {
  res.json([
    {
      page: 'http://localhost:9527/#/dashboard',
      buttons: ['add', 'delete', 'edit'],
    },
  ]);
};

export default {
  'GET /api/permissionButtons': getButtons,
};
