export interface Handler {
  handle(data: any): Promise<void>;
  getInintitalData(invite_user?: number): any;
  process(data: any, context?: Record<string, any>): Promise<void>;
}
