import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { AuthResponseDto } from './dto/auth.dto';
import { UserResponseDto } from 'src/user/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  /**
   * Authenticate a user and return JWT + user info.
   * @param email User email
   * @param password User password
   * @returns AuthResponseDto with user and accessToken
   */
  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.userService.findUnique({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
    };
  }

  /**
   * Register a new user and return JWT + user info.
   * @param email User email
   * @param password User password
   * @returns AuthResponseDto with user and accessToken
   */
  async register(email: string, password: string): Promise<AuthResponseDto> {
    const existing = await this.userService.findUnique({ email });
    if (existing) throw new ConflictException('Email already in use');

    const user = await this.userService.create({ email, password });

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
    };
  }
}
