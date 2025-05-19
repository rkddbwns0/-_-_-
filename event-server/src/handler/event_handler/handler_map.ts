import { FriendInviteEventHandler } from './friend_invite.handler';
import { Handler } from './handler';
import { LoginEventHandler } from './login_event.handler';

export const handlerMap: Record<string, Handler> = {
  출석: new LoginEventHandler(),
  초대: new FriendInviteEventHandler(),
};
