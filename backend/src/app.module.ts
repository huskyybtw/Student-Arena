import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { RiotModule } from './riot/riot.module';
import { PlayerModule } from './player/player.module';
import { TeamModule } from './team/team.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    UserModule,
    RiotModule,
    PlayerModule,
    TeamModule,
  ],
  controllers: [AppController],
  providers: [AppService, UserService],
})
export class AppModule {}
