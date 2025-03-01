import { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";

export const forwardRequest =
  (handler: (req: Request, res: Response) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (e) {
      next(e);
    }
  };

export function parseGetFilters(req: Request) {
  const { page } = req.query;

  delete req.query.page;
  const query = { ...req.query };

  return { query, page };
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "/tmp/");
    },
    filename: (req, file, cb) => {
      cb(null, `${req.context.reqId}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const fileTypes = /excel|spreadsheet|xlsx|csv|png|jpg|jpeg|svg|webp/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("File type is not supported."));
    }
  },
});
