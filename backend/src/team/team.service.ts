import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TeamService {
    constructor (private readonly prisma: PrismaService){}

    async create(){
        
    }
}
