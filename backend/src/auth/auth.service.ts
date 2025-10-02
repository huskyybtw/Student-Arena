import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { AuthResponseDto, AuthUserDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  /**
   * Creates an instance of AuthService.
   * @param jwtService JWT service for signing tokens
   * @param userService User service for user operations
   */
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  /**
   * Authenticates a user and returns an access token and user info.
   * @param email User's email
   * @param password User's password
   * @returns AuthResponseDto containing user and JWT access token
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(email: string, password: string): Promise<AuthResponseDto> {
    const user = await this.userService.findUnique({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    const authUser: AuthUserDto = { id: user.id, email: user.email };

    return {
      user: authUser,
      accessToken,
    };
  }

  /**
   * Registers a new user and returns an access token and user info.
   * @param email User's email
   * @param password User's password
   * @returns AuthResponseDto containing user and JWT access token
   * @throws ConflictException if email is already in use
   */
  async register(email: string, password: string): Promise<AuthResponseDto> {
    const existing = await this.userService.findUnique({ email });
    if (existing) throw new ConflictException('Email already in use');

    const user = await this.userService.create({ email, password });

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    const authUser: AuthUserDto = { id: user.id, email: user.email };

    return {
      user: authUser,
      accessToken,
    };
  }
}
