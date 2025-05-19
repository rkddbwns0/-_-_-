import { RewardLog } from 'src/schema/rewardLog.schema';

export interface RewardLogParmas {
  type: '보상 요청' | '중복 보상 요청' | '보상 지급';
  user_id: number;
  admin_id?: number;
  event_no: number;
  request_at?: Date;
  reward_given_at?: Date;
  reward_detail?: Record<string, any>;
  message?: string;
}

export async function rewardLogHandler(
  data: RewardLogParmas,
): Promise<RewardLogParmas> {
  const {
    type,
    user_id,
    admin_id,
    event_no,
    request_at,
    reward_given_at,
    reward_detail,
    message,
  } = data;

  let log: RewardLogParmas;

  if (type === '보상 요청') {
    log = {
      type: '보상 요청',
      user_id,
      event_no,
      request_at: new Date(),
      message: `${user_id} 유저가 ${event_no}번 이벤트 보상을 요청하였습니다.`,
    };
  } else if (type === '중복 보상 요청') {
    log = {
      type: '중복 보상 요청',
      user_id,
      event_no,
      request_at: new Date(),
      message: '유저가 이벤트 중복 보상 요청을 하였습니다.',
    };
  } else {
    throw new Error('type error');
  }
  return log;
}

export async function rewardLogHandlerMany(
  data: RewardLogParmas[],
): Promise<RewardLogParmas[]> {
  const many_log = data.map((data) => {
    const {
      type,
      user_id,
      admin_id,
      event_no,
      request_at,
      reward_given_at,
      reward_detail,
      message,
    } = data;

    const log: RewardLogParmas = {
      type: '보상 지급',
      user_id,
      event_no,
    };

    log.admin_id = admin_id;
    log.reward_given_at = new Date();
    log.reward_detail = reward_detail;
    log.message = `${log.event_no}번 이벤트 보상을 ${log.user_id}번 유저님에게 지급하였습니다.`;

    return log;
  });
  return many_log;
}
