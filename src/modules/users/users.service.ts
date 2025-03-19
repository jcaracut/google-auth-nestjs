import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find().then((users) => {
      console.log('Users fetched:', users);
      return users;
    });
    // return this.userRepository.find();
  }
  findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async comparePasswords(plainTextPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  async createUser(
    user: Pick<User, 'email' | 'name' | 'password'>,
  ): Promise<User> {
    // Check if the user already exists
    const existingUser = await this.findByEmail(user.email);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Insert user into database
    const newUser = this.userRepository.create({
      name: user.name,
      email: user.email,
      password: hashedPassword,
    });
    await this.userRepository.insert(newUser);

    return newUser;
  }
}
