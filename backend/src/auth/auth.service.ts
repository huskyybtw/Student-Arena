import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { AuthResponseDto, AuthUserResponseDto } from './dto/auth.dto';
import { PlayerService } from '../player/player.service';
import { PlayerResponseDto } from 'src/player/dto/player-response.dto';

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
    private readonly playerService: PlayerService,
  ) {}

  /**
   * Authenticates a user and returns an access token and user info.
   * @param email User's email
   * @param password User's password
   * @returns AuthResponseDto containing user and JWT access token
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(email: string, password: string) {
    const user = await this.userService.findUnique({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const player = await this.playerService.findOne({ userId: user.id });
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        playerAccount: player as PlayerResponseDto,
      },
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
  async register(email: string, password: string) {
    const existing = await this.userService.findUnique({ email });
    if (existing) throw new ConflictException('Email already in use');

    const user = await this.userService.create({ email, password });
    const player = await this.playerService.preCreate(user.id);

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        playerAccount: player as PlayerResponseDto,
      },
      accessToken,
    };
  }
}
