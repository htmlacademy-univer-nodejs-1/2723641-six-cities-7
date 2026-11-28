import { resolve } from 'node:path';

import type { NextFunction, Request, RequestHandler, Response } from 'express';

import multer from 'multer';
import mime from 'mime-types';
import { nanoid } from 'nanoid';
import { StatusCodes } from 'http-status-codes';

import { HttpError } from '../errors/http-error.js';
import type { Middleware } from './middleware.interface.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export class UploadFileMiddleware implements Middleware {
  private readonly upload: RequestHandler;

  constructor(uploadDirectory: string, fieldName: string) {
    const storage = multer.diskStorage({
      destination: resolve(uploadDirectory),

      filename: (_req, file, callback) => {
        const extension = mime.extension(file.mimetype);

        if (!extension) {
          callback(
            new HttpError(
              StatusCodes.UNSUPPORTED_MEDIA_TYPE,
              'Не удалось определить расширение файла',
            ),
            '',
          );

          return;
        }

        callback(null, `${nanoid()}.${extension}`);
      },
    });

    this.upload = multer({
      storage,

      limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
        fields: 0,
      },

      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(
            new HttpError(
              StatusCodes.UNSUPPORTED_MEDIA_TYPE,
              'Допускаются только изображения JPG и PNG',
            ),
          );

          return;
        }

        callback(null, true);
      },
    }).single(fieldName);
  }

  public async execute(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    await new Promise<void>((resolveUpload, rejectUpload) => {
      this.upload(req, res, (error: unknown) => {
        if (error) {
          rejectUpload(error);
          return;
        }

        resolveUpload();
      });
    });

    if (!req.file) {
      throw new HttpError(StatusCodes.BAD_REQUEST, 'Необходимо передать файл');
    }

    next();
  }
}
