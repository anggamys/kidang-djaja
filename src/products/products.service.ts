import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/helpers/response.helper';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { name, description, categoriesId, price, stock, image } =
      createProductDto;

    this.logger.log(`Creating product: ${name}`);

    try {
      // Mengecek apakah produk sudah ada
      const existingProduct = await this.prismaService.products.findFirst({
        where: { name },
      });

      if (existingProduct) {
        this.logger.warn(`Product already exists: ${name}`);
        throw new HttpException(
          ApiResponse.error(HttpStatus.CONFLICT, 'Product already exists'),
          HttpStatus.CONFLICT, // 409 Conflict jika produk sudah ada
        );
      }

      // Mengecek apakah kategori ada
      const category = await this.prismaService.categories.findUnique({
        where: { id: Number(categoriesId) },
      });

      if (!category) {
        this.logger.warn(`Category not found: ${categoriesId}`);
        throw new HttpException(
          ApiResponse.error(HttpStatus.NOT_FOUND, 'Category not found'),
          HttpStatus.NOT_FOUND, // 404 Not Found jika kategori tidak ditemukan
        );
      }

      // Membuat produk baru
      const product = await this.prismaService.products.create({
        data: {
          name,
          description,
          categoriesId: category.id,
          price,
          stock,
          image,
        },
      });

      this.logger.log(`Product created successfully: ${product.id}`);
      return ApiResponse.success(
        HttpStatus.CREATED, // 201 Created jika produk berhasil dibuat
        'Product created',
        product,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Lempar ulang HttpException tanpa memodifikasi
      }

      this.logger.error('Failed to create product', error.stack);
      throw new HttpException(
        ApiResponse.error(
          HttpStatus.INTERNAL_SERVER_ERROR, // 500 Internal Server Error jika ada masalah lain
          'Internal server error',
          error.message || error,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      this.logger.log('Retrieving all products');
      const products = await this.prismaService.products.findMany();

      this.logger.log(`Retrieved ${products.length} products`);
      return ApiResponse.success(HttpStatus.OK, 'Products retrieved', products);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Lempar ulang HttpException tanpa memodifikasi
      }

      this.logger.error('Failed to retrieve products', error.stack);
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
      this.logger.log(`Retrieving product: ${id}`);
      const product = await this.prismaService.products.findUnique({
        where: { id },
      });

      if (!product) {
        this.logger.warn(`Product not found: ${id}`);
        throw new HttpException(
          ApiResponse.error(HttpStatus.NOT_FOUND, 'Product not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      this.logger.log(`Retrieved product: ${product.id}`);
      return ApiResponse.success(HttpStatus.OK, 'Product retrieved', product);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Lempar ulang HttpException tanpa memodifikasi
      }

      this.logger.error('Failed to retrieve product', error.stack);
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

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { name, description, categoriesId, price, stock, image } =
      updateProductDto;

    try {
      this.logger.log(`Updating product: ${id}`);
      const product = await this.prismaService.products.findUnique({
        where: { id },
      });

      if (!product) {
        this.logger.warn(`Product not found: ${id}`);
        throw new HttpException(
          ApiResponse.error(HttpStatus.NOT_FOUND, 'Product not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      const category = await this.prismaService.categories.findUnique({
        where: { id: Number(categoriesId) },
      });

      if (!category) {
        this.logger.warn(`Category not found: ${categoriesId}`);
        throw new HttpException(
          ApiResponse.error(HttpStatus.NOT_FOUND, 'Category not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      const updatedProduct = await this.prismaService.products.update({
        where: { id },
        data: {
          name,
          description,
          categoriesId: category.id,
          price,
          stock,
          image,
        },
      });

      this.logger.log(`Product updated successfully: ${id}`);
      return ApiResponse.success(
        HttpStatus.OK,
        'Product updated',
        updatedProduct,
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Lempar ulang HttpException tanpa memodifikasi
      }

      this.logger.error('Failed to update product', error.stack);
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
      this.logger.log(`Deleting product: ${id}`);
      const product = await this.prismaService.products.findUnique({
        where: { id },
      });

      if (!product) {
        this.logger.warn(`Product not found: ${id}`);
        throw new HttpException(
          ApiResponse.error(HttpStatus.NOT_FOUND, 'Product not found'),
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prismaService.products.delete({
        where: { id },
      });

      this.logger.log(`Product deleted successfully: ${id}`);
      return ApiResponse.success(HttpStatus.OK, 'Product deleted', {});
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Lempar ulang HttpException tanpa memodifikasi
      }

      this.logger.error('Failed to delete product', error.stack);
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
