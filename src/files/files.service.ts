import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { ApiResponse } from 'src/helpers/response.helper';
import * as fs from 'fs';

// {
//     "statusCode": 200,
//     "status": "success",
//     "message": "File uploaded",
//     "data": {
//         "fieldname": "file",
//         "originalname": "person.jpg",
//         "encoding": "7bit",
//         "mimetype": "image/jpeg",
//         "destination": "./uploads",
//         "filename": "1737373904887-person.jpg",
//         "path": "uploads/1737373904887-person.jpg",
//         "size": 9148
//     }
// }

@Injectable()
export class FilesService {
  async handleFileUpload(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException(
          ApiResponse.error(HttpStatus.BAD_REQUEST, 'No file uploaded'),
          HttpStatus.BAD_REQUEST,
        );
      }

      const fileExtension = file.originalname.split('.').pop().toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

      if (!validExtensions.includes(fileExtension)) {
        throw new HttpException(
          ApiResponse.error(HttpStatus.BAD_REQUEST, 'Invalid file extension'),
          HttpStatus.BAD_REQUEST,
        );
      }

      return ApiResponse.success(200, 'File uploaded', file);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ApiResponse.error(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Internal server error',
          error.message || error,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFile(filePath: string) {
    const file = filePath;

    try {
      // Masuk ke folder uploads
      const uploadFolder = 'uploads';
      const filePath = `${uploadFolder}/${file}`;

      if (!fs.existsSync(filePath)) {
        throw new HttpException(
          ApiResponse.error(HttpStatus.NOT_FOUND, 'File not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      fs.unlinkSync(filePath);

      return ApiResponse.success(200, 'File deleted', {});
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        ApiResponse.error(
          HttpStatus.INTERNAL_SERVER_ERROR,
          'Internal server error',
          error.message || error,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // create(createFileDto: CreateFileDto) {
  //   return 'This action adds a new file';
  // }
  // findAll() {
  //   return `This action returns all files`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} file`;
  // }
  // update(id: number, updateFileDto: UpdateFileDto) {
  //   return `This action updates a #${id} file`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} file`;
  // }
}
