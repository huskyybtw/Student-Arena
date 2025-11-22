import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrganizationsService } from './organizations.service';
import { CurrentUser } from 'src/common/current-user.decorator';
import { User } from '@prisma/client';
import { OrganizationCreateDto } from './dto/organization-create.dto';
import { OrganizationUpdateDto } from './dto/organization-update.dto';
import { OrganizationResponseDto } from './dto/organization-response.dto';

@ApiTags('organizations')
@Controller('organizations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @ApiResponse({
    status: 200,
    description: "Get the current user's organization",
    type: OrganizationResponseDto,
  })
  @HttpCode(200)
  @Get('/')
  async getMyOrganization(
    @CurrentUser() user: User,
  ): Promise<OrganizationResponseDto> {
    const organization = await this.organizationsService.findUsersOrganization(
      user.id,
    );

    if (!organization) {
      throw new NotFoundException('You do not own an organization');
    }

    return organization as OrganizationResponseDto;
  }

  @ApiBody({ type: OrganizationCreateDto })
  @ApiResponse({
    status: 201,
    description: 'Create a new organization',
    type: OrganizationResponseDto,
  })
  @HttpCode(201)
  @Post('/')
  async create(
    @CurrentUser() user: User,
    @Body() body: OrganizationCreateDto,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.create(
      user.id,
      body,
    ) as Promise<OrganizationResponseDto>;
  }

  @ApiParam({ name: 'id', description: 'Organization ID', type: Number })
  @ApiBody({ type: OrganizationUpdateDto })
  @ApiResponse({
    status: 200,
    description: 'Update an existing organization',
    type: OrganizationResponseDto,
  })
  @HttpCode(200)
  @Patch('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
    @Body() body: OrganizationUpdateDto,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.update(
      id,
      user.id,
      body,
    ) as Promise<OrganizationResponseDto>;
  }

  @ApiParam({ name: 'id', description: 'Organization ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Delete an organization',
    type: OrganizationResponseDto,
  })
  @HttpCode(200)
  @Delete('/:id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.delete(
      id,
      user.id,
    ) as Promise<OrganizationResponseDto>;
  }
}
