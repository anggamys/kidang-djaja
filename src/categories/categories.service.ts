import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiResponse } from 'src/helpers/response.helper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name, description } = createCategoryDto;

    try {
      this.logger.log(`Creating category: ${name}`);

      const existingCategory = await this.prismaService.categories.findFirst({
        where: { name },
      });

      if (existingCategory) {
        this.logger.warn(`Category already exists: ${name}`);
        throw new HttpException(
          ApiResponse.error(HttpStatus.CONFLICT, 'Category already exists'),
          HttpStatus.CONFLICT,
        );
      }

      const category = await this.prismaService.categories.create({
        data: { name, description },
      });

      this.logger.log(`Category created successfully: ${category.id}`);
      return ApiResponse.success(
        HttpStatus.CREATED,
        'Category created',
        category,
      );
    } catch (error) {
      this.logger.error('Failed to create category', error.stack);
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

  async findAll() {
    try {
      this.logger.log('Retrieving all categories');
      const categories = await this.prismaService.categories.findMany();

      this.logger.log(`Retrieved ${categories.length} categories`);
      return ApiResponse.success(
        HttpStatus.OK,
        'Categories retrieved',
        categories,
      );
    } catch (error) {
      this.logger.error('Failed to retrieve categories', error.stack);
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

  async findOne(id: number) {
    try {
      this.logger.log(`Retrieving category with ID: ${id}`);
      const category = await this.prismaService.categories.findUnique({
        where: { id },
      });

      if (!category) {
        this.logger.warn(`Category not found: ${id}`);
        throw new HttpException(
          ApiResponse.error(HttpStatus.NOT_FOUND, 'Category not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      this.logger.log(`Category retrieved successfully: ${id}`);
      return ApiResponse.success(HttpStatus.OK, 'Category retrieved', category);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve category with ID: ${id}`,
        error.stack,
      );
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

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { name, description } = updateCategoryDto;
    try {
      this.logger.log(`Updating category with ID: ${id}`);

      return await this.prismaService.$transaction(async (tx) => {
        const existingCategory = await tx.categories.findUnique({
          where: { id },
        });

        if (!existingCategory) {
          this.logger.warn(`Category not found: ${id}`);
          throw new HttpException(
            ApiResponse.error(HttpStatus.NOT_FOUND, 'Category not found'),
            HttpStatus.NOT_FOUND,
          );
        }

        const category = await tx.categories.update({
          where: { id },
          data: { name, description },
        });

        this.logger.log(`Category updated successfully: ${id}`);
        return ApiResponse.success(HttpStatus.OK, 'Category updated', category);
      });
    } catch (error) {
      this.logger.error(
        `Failed to update category with ID: ${id}`,
        error.stack,
      );
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

  async remove(id: number) {
    try {
      this.logger.log(`Deleting category with ID: ${id}`);

      return await this.prismaService.$transaction(async (tx) => {
        const existingCategory = await tx.categories.findUnique({
          where: { id },
        });

        if (!existingCategory) {
          this.logger.warn(`Category not found: ${id}`);
          throw new HttpException(
            ApiResponse.error(HttpStatus.NOT_FOUND, 'Category not found'),
            HttpStatus.NOT_FOUND,
          );
        }

        await tx.categories.delete({ where: { id } });
        this.logger.log(`Category deleted successfully: ${id}`);

        return ApiResponse.success(HttpStatus.OK, 'Category deleted', {});
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete category with ID: ${id}`,
        error.stack,
      );
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
}
