import { Test, TestingModule } from '@nestjs/testing';
import { RiotService } from './riot.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import {
  validPuid,
  validPlayer,
  inValidPlayer,
  validProfileIcon,
  inValidPuid,
} from '../player/player.controller.spec';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RiotService', () => {
  let service: RiotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, ConfigModule],
      providers: [RiotService],
    }).compile();

    service = module.get<RiotService>(RiotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAccountByGameName', () => {
    it('should pass if valid gameName and tagline is provided', async () => {
      const player = validPlayer();
      const response = await service.getAccountByGameName(
        player.gameName,
        player.tagLine,
      );

      expect(response).toBeDefined();
      expect(response.puuid).toEqual(validPuid());
      expect(response.gameName).toBe(player.gameName);
      expect(response.tagLine).toBe(player.tagLine);
    });
    it('should throw NotFoundException if invalid gameName and tagline is provided', async () => {
      const invalidPlayer = inValidPlayer();
      const invalidGameName = invalidPlayer.gameName;
      const invalidTagLine = invalidPlayer.tagLine;
      await expect(
        service.getAccountByGameName(invalidGameName, invalidTagLine),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
  describe('getAccountByPuuid', () => {
    it('should pass if valid puuid is provided', async () => {
      const player = validPlayer();
      const puuid = validPuid();
      const response = await service.getAccountByPuuid(puuid);

      expect(response).toBeDefined();
      expect(response.puuid).toEqual(validPuid());
      expect(response.gameName).toBe(player.gameName);
      expect(response.tagLine).toBe(player.tagLine);
    });
    it('should throw BadRequestException if puuid is provided', async () => {
      const puuid = inValidPuid();

      await expect(service.getAccountByPuuid(puuid)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
  describe('getSummonerByPuuid', () => {
    it('should pass if valid puuid is provided', async () => {
      const profileIcon = validProfileIcon();
      const puuid = validPuid();
      const response = await service.getSummonerByPuuid(puuid);

      expect(response).toBeDefined();
      expect(response.puuid).toEqual(validPuid());
      expect(response.profileIconId).toBe(profileIcon.profileIconId);
    });
    it('should throw BadRequestException if invalid gameName and tagline is provided', async () => {
      const puuid = inValidPuid();
      await expect(service.getSummonerByPuuid(puuid)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
  describe('getPlayerMetadataByPuuid', () => {
    it('should pass if valid puuid is provided', async () => {
      const puuid = validPuid();
      const player = validPlayer();
      const response = await service.getPlayerMetadataByPuuid(puuid);
      const { account, summoner } = response;

      expect(response).toBeDefined();
      expect(account.puuid).toEqual(puuid);
      expect(account.gameName).toBe(player.gameName);
      expect(account.tagLine).toBe(player.tagLine);
      expect(summoner.profileIconId).toBe(validProfileIcon().profileIconId);
    });
    it('should throw BadRequestException if invalid puuid is provided', async () => {
      const puuid = inValidPuid();
      await expect(
        service.getPlayerMetadataByPuuid(puuid),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });
});
