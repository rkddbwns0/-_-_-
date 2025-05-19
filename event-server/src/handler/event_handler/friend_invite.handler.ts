import { Handler } from './handler';

export class FriendInviteEventHandler implements Handler {
  getInintitalData(invited_user?: number) {
    return {
      count: invited_user ? 1 : 0,
      invited_user: invited_user ? [invited_user] : [],
      complete_at: null,
    };
  }

  async handle(data: any): Promise<void> {
    const mergeData = { ...this.getInintitalData(), ...data };
    await this.process(mergeData);
  }

  async process(data: any, context?: Record<string, any>): Promise<void> {
    const record = {
      ...data,
      context,
    };
  }
}
