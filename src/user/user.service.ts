import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtUser } from '../common/interfaces/jwt-user';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserUiQueryDto } from './dto/user-ui.dto';
import { PrismaClient } from '@prisma/client';

// Type for the object returned by select (via PrismaClient)
export type UserSafeSelect =
  ReturnType<PrismaClient['user']['findFirst']> extends Promise<infer T>
    ? T extends {
        id: string;
        name: string;
        email: string;
        role: any;
        createdAt: Date;
        updatedAt: Date;
      }
      ? Pick<T, 'id' | 'name' | 'email' | 'role' | 'createdAt' | 'updatedAt'>
      : never
    : never;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hash,
        role: dto.role,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  async removeRefreshToken(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async getUserByRefreshToken(token: string) {
    return this.prisma.user.findFirst({
      where: { refreshToken: token },
    });
  }

  async getUserInfo(id: string): Promise<JwtUser> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) throw new Error('User not found');
    return { email: user.email, id: user.id, role: user.role };
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const data: Record<string, unknown> = {};
    if (dto.email && dto.email !== '') data.email = dto.email;
    if (dto.password && dto.password !== '') {
      data.password = await bcrypt.hash(dto.password, 10);
    }
    if (dto.name && dto.name !== '') data.name = dto.name;
    if (dto.role !== undefined) data.role = dto.role;
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUiList(query: UserUiQueryDto): Promise<any> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    // Filters
    const andFilters: Record<string, unknown>[] = [];
    if (query.email)
      andFilters.push({
        email: { contains: query.email, mode: 'insensitive' },
      });
    if (query.role) andFilters.push({ role: query.role });

    if (query.name) andFilters.push({ name: query.name, mode: 'insensitive' });

    // Search
    let orSearch: Record<string, unknown>[] | undefined = undefined;
    if (query.search) {
      orSearch = [{ email: { contains: query.search, mode: 'insensitive' } }];
      const searchUpper = query.search.toUpperCase();
      if (['ADMIN', 'EDITOR', 'USER'].includes(searchUpper)) {
        orSearch.push({ role: searchUpper });
      }
    }

    const where: Record<string, unknown> = {};
    if (andFilters.length > 0) where.AND = andFilters;
    if (orSearch) where.OR = orSearch;

    const [rawData, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      data: rawData,
      total,
      page,
      limit,
    };
  }

  toResponseDto(user: UserSafeSelect) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
