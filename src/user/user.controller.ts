import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/user.decorator';
import { JwtUser } from '../common/interfaces/jwt-user';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserUiQueryDto, UserUiPaginatedDto } from './dto/user-ui.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './dto/create-user.dto';
import { ApiPaginationQuery } from '../common/decorators/api-pagination-query.decorator';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Public()
  @Post('register')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({ type: CreateUserDto })
  async register(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.create(dto);
    return this.userService.toResponseDto(user);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get user data' })
  async getUserInfo(@CurrentUser() user: JwtUser): Promise<UserResponseDto> {
    const entity = await this.userService.findById(user.id);
    if (!entity) throw new NotFoundException('User not found');
    return this.userService.toResponseDto(entity);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userService.findAll();
    return users.map(u => this.userService.toResponseDto(u));
  }

  @Get('ui')
  @ApiOperation({ summary: 'Get users for UI (paginated, filter, search)' })
  @ApiPaginationQuery()
  async getUiList(@Query() query: UserUiQueryDto): Promise<UserUiPaginatedDto> {
    return this.userService.getUiList(query) as Promise<UserUiPaginatedDto>;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.userService.toResponseDto(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiBody({ type: UpdateUserDto })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
    console.log(id);
    const user = await this.userService.update(id, dto);
    if (!user) throw new NotFoundException('User not found');
    return this.userService.toResponseDto(user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  async remove(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.remove(id);
    if (!user) throw new NotFoundException('User not found');
    return this.userService.toResponseDto(user);
  }
}
