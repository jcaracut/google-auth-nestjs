import { Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './infrastructure/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot(<ConfigModuleOptions>{ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
