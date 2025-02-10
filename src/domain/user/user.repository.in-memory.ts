import { User } from './user.model';
import { UserRepository } from './user.repository';

class UserRepositoryInMemory implements UserRepository {
  private users: User[] = [];

  async createUser(user: User): Promise<User> {
    this.users.push(user);

    return user;
  }

  async getUserById(id: string): Promise<User> {
    const user = this.users.find((user) => user.id === id);

    if (!user) {
      throw new Error(`Failed to find user with ID: ${id}`);
    }

    return user;
  }

  async getUserByExternalId(externalId: string): Promise<User> {
    const user = this.users.find((user) => user.externalId === externalId);

    if (!user) {
      throw new Error(`Failed to find user with external ID: ${externalId}`);
    }

    return user;
  }

  async updateUser(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id === user.id);

    if (index === -1) {
      throw new Error(`Failed to find user with ID: ${user.id}`);
    }

    this.users[index] = user;

    return user;
  }

  async deleteUser(id: string): Promise<void> {
    this.users = this.users.filter((user) => user.id !== id);
  }
}

export default UserRepositoryInMemory;
