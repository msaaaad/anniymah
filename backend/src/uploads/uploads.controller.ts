import { BadRequestException, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Express } from 'express';
import { SessionGuard } from '../auth/session.guard.js';
import { SESSION_COOKIE } from '../auth/session.service.js';
import { StorageService } from '../storage/storage.service.js';

const MAX_UPLOAD_BYTES_PER_FILE = 5 * 1024 * 1024;
const MAX_FILES = 8;

@ApiTags('uploads')
@ApiCookieAuth(SESSION_COOKIE)
@UseGuards(SessionGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', MAX_FILES, { limits: { fileSize: MAX_UPLOAD_BYTES_PER_FILE } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } },
  })
  @ApiOperation({ summary: `Upload up to ${MAX_FILES} images, returns their public URLs in order` })
  @ApiResponse({ status: 201, description: 'Uploaded' })
  async upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new BadRequestException('No files provided');
    }
    for (const file of files) {
      if (!this.storage.isAllowedType(file.mimetype)) {
        throw new BadRequestException(`Unsupported image type: ${file.mimetype}`);
      }
    }

    const urls = await Promise.all(files.map((file) => this.storage.upload(file)));
    return { urls };
  }
}
