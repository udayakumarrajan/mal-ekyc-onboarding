import { User } from '../types';
import bcrypt from 'bcrypt';

class UserRepository {
  private users: Map<string, User> = new Map();
  private seeded = false;

  constructor() {
    // Seed data will be called on first access
  }

  private async ensureSeeded() {
    if (this.seeded) return;
    
    const passwordHash = await bcrypt.hash('password123', 10);
    this.users.set('USR-001', {
      id: 'USR-001',
      email: 'test@example.com',
      passwordHash,
      fullName: 'Test User',
    });
    
    this.seeded = true;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    await this.ensureSeeded();
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    await this.ensureSeeded();
    return this.users.get(id);
  }

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}

export default new UserRepository();
