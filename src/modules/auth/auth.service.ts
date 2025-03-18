import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateUser(email: string, password: string): Promise<boolean> {
    const users = await this.usersService.findAll();
    const user = users.find(
      (user) => user.email === email && user.password === password,
    );
    return !!user;
  }
}
