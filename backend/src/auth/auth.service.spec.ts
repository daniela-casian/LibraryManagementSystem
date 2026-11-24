
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(username: string, password: string) {
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!passwordHash || !process.env.JWT_SECRET) {
      throw new InternalServerErrorException(
        'Autentificarea nu este configurată.',
      );
    }

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      username !== 'admin'
    ) {
      throw new UnauthorizedException(
        'Nume de utilizator sau parolă incorectă.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Nume de utilizator sau parolă incorectă.',
      );
    }

    const accessToken = await this.jwtService.signAsync({
      sub: 'admin',
      role: 'admin',
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }
}
