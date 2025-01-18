import {
  IsString,
  IsInt,
  IsNumber,
  IsPositive,
  IsOptional,
  IsUrl,
  IsDate,
  IsNotEmpty,
} from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsString()
  @IsNotEmpty()
  categoriesId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  stock: number;

  @IsNotEmpty()
  @IsString()
  image: string;
}
