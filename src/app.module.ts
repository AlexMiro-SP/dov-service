import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SnippetModule } from './snippet/snippet.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { VariationService } from './variation/variation.service';
import { VariationController } from './variation/variation.controller';
import { VariationModule } from './variation/variation.module';
import { SubSnippetModule } from './sub-snippet/sub-snippet.module';
import { SyncModule } from './sync/sync.module';
import { ParagraphModule } from './paragraph/paragraph.module';
import { TemplateParameterModule } from './template-parameter/template-parameter.module';
import { AssignmentModule } from './assignment/assignment.module';
import { CategoryTypeModule } from './category-type/category-type.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SnippetModule,
    UserModule,
    AuthModule,
    PrismaModule,
    VariationModule,
    SubSnippetModule,
    SyncModule,
    ParagraphModule,
    TemplateParameterModule,
    AssignmentModule,
    CategoryTypeModule,
    RedisModule,
  ],
  controllers: [AppController, VariationController],
  providers: [AppService, JwtStrategy, VariationService],
})
export class AppModule {}
