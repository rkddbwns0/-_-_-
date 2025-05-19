import { Handler } from './handler';

export class LoginEventHandler implements Handler {
  getInintitalData() {
    return {
      count: 0,
      login_at: null,
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
