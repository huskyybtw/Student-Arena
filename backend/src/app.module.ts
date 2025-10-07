import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { RiotApiModule } from './riot-api/riot-api.module';
import { RiotModule } from './riot/riot.module';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, AuthModule, UserModule, RiotApiModule, RiotModule, PlayerModule],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
