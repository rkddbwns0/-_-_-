import { IsDate, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/schema/user.schema';

export class SignupAdminDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: '';

  @IsNotEmpty()
  @IsEnum(Role, { message: 'Invalid role' })
  role: Role;
}
export class AdminLoginDto {
  // admin의 경우 users db에 같이 데이터를 관리하지만 이메일 형식이 아ㄴ
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
