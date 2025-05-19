import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, StringSchemaDefinition, Types } from 'mongoose';
import { Event, EventDocument } from 'src/schema/event.schema';
import { Reward, RewardDocument } from 'src/schema/reward.schema';
import {
  CreateEventDto,
  CreateRewardDto,
  EventParticipationDto,
  ReadRewardLogDto,
} from './event.dto';
import {
  UserEventLog,
  UserEventLogDocument,
} from 'src/schema/userEventLog.schema';
import {
  userRewardLog,
  userRewardLogDocument,
} from 'src/schema/userRewardLog.schema';
import { UserDocument, Users } from 'src/schema/user.schema';
import { handlerMap } from 'src/handler/event_handler/handler_map';
import { RewardLog, RewardLogDocument } from 'src/schema/rewardLog.schema';
import {
  rewardLogHandler,
  rewardLogHandlerMany,
  RewardLogParmas,
} from 'src/handler/rewardLog_hadler/rewardLog.handler';
import {
  RewardPaymentDetail,
  RewardPaymentDetailDocument,
} from 'src/schema/reward_payment_detail.schema';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name)
    private readonly event: Model<EventDocument>,

    @InjectModel(Reward.name)
    private readonly reward: Model<RewardDocument>,

    @InjectModel('EventCounter')
    private readonly eventCounter: Model<any>,

    @InjectModel('RewardCounter')
    private readonly rewardCounter: Model<any>,

    @InjectModel(UserEventLog.name)
    private readonly userEventLog: Model<UserEventLogDocument>,

    @InjectModel(userRewardLog.name)
    private readonly userRewardLog: Model<userRewardLogDocument>,

    @InjectModel(Users.name)
    private readonly users: Model<UserDocument>,

    @InjectModel(RewardLog.name)
    private readonly rewardLog: Model<RewardLogDocument>,

    @InjectModel(RewardPaymentDetail.name)
    private readonly rewardPaymentDetail: Model<RewardPaymentDetailDocument>,
  ) {}

  // 이벤트 생성
  // handler를 활용하여 이벤트 분류 별로 저장되는 조건 형식이 다름.
  // 다른 분류의 이벤트를 생성해야 되는 경우 hadler에 추가하여 활용할 수 있음.
  async createEvent(
    createEventDto: CreateEventDto,
    createRewardDto: CreateRewardDto,
  ) {
    try {
      createRewardDto.reward_no = await this.counterReward('reward_no');
      const reward = await this.reward.create(createRewardDto);
      const savedReward = await reward.save();

      if (!savedReward) {
        throw new BadRequestException('리워드 생성에 실패하였습니다.');
      }

      createEventDto.event_no = await this.counterEvent('event_no');
      createEventDto.end_at =
        createEventDto.end_at.replace(/\./g, '-').replace(' ', 'T') + ':00Z';
      createEventDto.reward = savedReward._id;

      const event = await this.event.create(createEventDto);

      if (createEventDto.auto_active === true) {
        const handler = handlerMap[createEventDto.classification];
        if (!handler) {
          throw new BadRequestException('이벤트 클래스가 정보가 없습니다.');
        }

        const initialData = await handler.getInintitalData();
        const users = await this.users.find({ role: 'user' }, 'user_id').lean();

        const usersMap = users.map((user) => ({
          user_id: user.user_id,
          event_no: createEventDto.event_no,
          event_type: createEventDto.classification,
          data: initialData,
        }));

        await this.userEventLog.insertMany(usersMap);
      }

      const savedEvent = await event.save();

      if (!savedEvent) {
        throw new BadRequestException('이벤트 생성에 실패하였습니다.');
      }

      return savedEvent;
    } catch (e) {
      console.error(e);
    }
  }

  // event_no 순서 생성
  async counterEvent(seqName: string): Promise<number> {
    try {
      const seqUpdate = await this.eventCounter.findOneAndUpdate(
        { _id: seqName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      );

      if (!seqUpdate) {
        throw new BadRequestException('순서 생성에 실패하였습니다.');
      }

      return seqUpdate.seq;
    } catch (e) {
      console.error(e);
      throw new BadRequestException('순서 생성에 실패하였습니다.');
    }
  }

  // reward_no 순서 생성
  async counterReward(seqName: string): Promise<number> {
    try {
      const seqUpdate = await this.rewardCounter.findOneAndUpdate(
        { _id: seqName },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      );
      if (!seqUpdate) {
        throw new BadRequestException('순서 생성에 실패하였습니다.');
      }
      return seqUpdate.seq;
    } catch (e) {
      console.error(e);
      throw new BadRequestException('순서 생성에 실패하였습니다.');
    }
  }

  // 이벤트 리스트
  async eventList(classification: string): Promise<Event[]> {
    try {
      const eventList = await this.event
        .find({ classification: classification })
        .populate('reward');

      if (eventList.length === 0) {
        throw new BadRequestException('등록된 이벤트가 없습니다.');
      }

      return eventList;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  // 이벤트 참여
  // handler를 활용하여 이벤트 분류 별로 저장되는 조건 형식이 다름.
  async eventParticipation(eventParticipationDto: EventParticipationDto) {
    try {
      const event = await this.event.findOne({
        event_no: eventParticipationDto.event_no,
      });
      const checkPartition = await this.userEventLog.findOne({
        event_no: eventParticipationDto.event_no,
        user_id: eventParticipationDto.user_id,
      });

      if (event?.state === false) {
        throw new BadRequestException('해당 이벤트는 종료된 이벤트입니다.');
      }

      if (checkPartition) {
        throw new BadRequestException('이미 이벤트에 참여 중입니다.');
      }
      if (eventParticipationDto.partition === true) {
        const event = await this.event.findOne({
          event_no: eventParticipationDto.event_no,
        });
        if (!event) {
          throw new BadRequestException('현재 진행 중인 이벤트가 아닙니다.');
        }
        eventParticipationDto.event_type = event.condition.type;
        const handler = handlerMap[event.classification];
        if (!handler) {
          throw new BadRequestException('이벤트 클래스가 정보가 없습니다.');
        }

        const initialData = await handler.getInintitalData();
        eventParticipationDto.data = initialData;
        const partition = await this.userEventLog.create(eventParticipationDto);
        await partition.save();
        return { message: '이벤트를 수락하였습니다.', partition };
      } else {
        return { message: '이벤트를 거절하였습니다.' };
      }
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  // 로그인 이벤트 로그 확인 및 업데이트
  async login_event(user_id: number, login_at: Date) {
    try {
      const checkEvent = await this.event.find({
        classification: '출석',
        start_at: { $lte: login_at },
        end_at: { $gte: login_at },
      });
      if (!checkEvent || checkEvent.length === 0) {
        throw new BadRequestException('출석 이벤트가 없습니다.');
      }

      const today = new Date().toISOString().slice(0, 10);

      for (const event of checkEvent) {
        const find_eventLog = await this.userEventLog.findOne({
          user_id: user_id,
          event_no: event.event_no,
        });

        if (find_eventLog) {
          const last_login = find_eventLog?.data.login_at;
          const log_date = last_login
            ? new Date(last_login).toISOString().slice(0, 10)
            : null;

          if (today === log_date) {
            continue;
          }

          console.log(find_eventLog.data);
          find_eventLog.data.count = (find_eventLog.data.count ?? 0) + 1;
          find_eventLog.data.login_at = login_at;

          find_eventLog.markModified('data');
          await find_eventLog.save();
        }
      }

      console.log('로그를 업데이트하였습니다.');
    } catch (e) {
      console.error(e);
    }
  }

  // 친구초대 이벤트 참여
  async invite_event(
    invite_code: string,
    invited_user: number,
    signup_at: Date,
  ) {
    try {
      const find_code = await this.users.findOne({
        code: invite_code,
      });
      if (!find_code) {
        throw new BadRequestException('존재하지 않는 코드입니다.');
      }
      console.log(find_code);
      const checkEvent = await this.event.find({
        classification: '초대',
        start_at: { $lte: signup_at },
        end_at: { $gte: signup_at },
      });

      console.log(checkEvent);
      if (!checkEvent || checkEvent.length === 0) {
        throw new BadRequestException('초대 이벤트가 없습니다.');
      }

      for (const event of checkEvent) {
        const find_eventLog = await this.userEventLog.findOne({
          user_id: find_code.user_id,
          event_no: event.event_no,
        });

        console.log(find_eventLog);

        if (!find_eventLog) {
          const handler = handlerMap['초대'];
          if (!handler) {
            throw new BadRequestException('이벤트 클래스가 정보가 없습니다.');
          }

          const initialData = handler.getInintitalData(invited_user);
          console.log(initialData);
          const userEventLog = await this.userEventLog.create({
            user_id: find_code.user_id,
            event_no: event.event_no,
            event_type: '초대',
            data: initialData,
          });
          await userEventLog.save();
          continue;
        }

        const invited = find_eventLog.data?.invited_user ?? [];

        if (invited.includes(invited_user)) {
          console.log(`이미 ${invited_user} 사용자를 초대함.`);
          continue;
        }

        find_eventLog.data.count = (find_eventLog.data.count ?? 0) + 1;
        invited.push(invited_user);
        find_eventLog.data.invited_user = invited;

        find_eventLog.markModified('data');
        await find_eventLog.save();
      }
    } catch (e) {
      console.error(e);
    }
  }

  // 리워드 요청
  async eventReward(user_id: number, event_no: number) {
    try {
      const checkReward = await this.userRewardLog.findOne({
        user_id: user_id,
        event_no: event_no,
      });

      if (checkReward?.reward_given === true) {
        const data: RewardLogParmas = {
          type: '중복 보상 요청',
          user_id: user_id,
          event_no: event_no,
        };
        const log = await rewardLogHandler(data);
        console.log(log);
        await this.rewardLog.create(log);

        throw new BadRequestException('이미 보상을 획득하였습니다.');
      } else if (checkReward) {
        throw new BadRequestException('이미 리워드를 요청하였습니다.');
      }
      const checkCondition = await this.checkCondition(user_id, event_no);
      if (checkCondition === true) {
        const reward = await this.userRewardLog.create({
          user_id: user_id,
          event_no: event_no,
        });
        await reward.save();

        const data: RewardLogParmas = {
          type: '보상 요청',
          user_id: user_id,
          event_no: event_no,
          reward_given_at: new Date(),
        };

        const log = await rewardLogHandler(data);

        console.log(log);

        await this.rewardLog.create(log);
        return { message: '리워드 요청을 완료하였습니다.', reward };
      } else {
        return { message: '조건에 맞지 않습니다.' };
      }
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }

  // 이벤트 참여 현황
  // 리워드를 요청하는 과정에서 참여 현황을 파악하고 조건과 일치할 경우 rewardLog에 저장
  async checkCondition(user_id: number, event_no: number) {
    try {
      const eventCount = await this.event
        .findOne({ event_no: event_no })
        .select('condition.count')
        .exec();
      const userEventLog = await this.userEventLog
        .findOne({ user_id: user_id, event_no: event_no })
        .select('data.count')
        .exec();

      console.log(
        typeof eventCount?.condition.count,
        typeof userEventLog?.data.count,
      );

      if (userEventLog?.data.count >= eventCount?.condition.count) {
        const state = await this.userEventLog.updateOne(
          { user_id: user_id, event_no: event_no },
          { $set: { state: true } },
        );
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
    }
  }

  // 자신이 요청한 리워드를 확인할 수 있음.
  // event_no를 지정할 경우 해당 이벤트에 대한 rewardLog를 보여주고,
  // 지정하지 않은 경우 요청한 모든 rewardLog를 보여줌
  async userReadRewardLog(user_id: number, event_no?: number) {
    try {
      if (event_no) {
        const rewardLog = await this.userRewardLog
          .find({ user_id: user_id, event_no: event_no })
          .exec();

        if (!rewardLog) {
          throw new BadRequestException('요청 내역이 없습니다.');
        }
        return rewardLog;
      }
      const rewardLog = await this.userRewardLog
        .find({ user_id: user_id })
        .exec();
      if (!rewardLog) {
        throw new BadRequestException('요청 내역이 없습니다.');
      }
      return rewardLog;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  // 보상 지급
  // userRewardLog에서 특정 event_no 이벤트의 리워드 지급 -> given_state 가 false인 요소들만만
  // 전체 현황 혹은 이벤트 별로 요청 리스트 확인 가능
  async userRewardPayment(admin_id: number, event_no: number) {
    try {
      const rewardLog = await this.userRewardLog
        .find({ event_no: event_no, reward_given: false })
        .exec();

      const rewardDetail = await this.event.aggregate([
        { $match: { event_no: event_no } },
        {
          $lookup: {
            from: 'reward',
            localField: 'reward',
            foreignField: '_id',
            as: 'reward',
          },
        },
        {
          $unwind: '$reward',
        },
      ]);
      console.log(rewardDetail);

      if (!rewardLog || rewardLog.length === 0) {
        throw new BadRequestException('보상 지급 명단이 없습니다.');
      }

      const rewardLogUpdate = await this.userRewardLog
        .updateMany(
          { event_no: event_no, reward_given: false },
          { $set: { reward_given: true } },
        )
        .exec();

      if (!rewardLogUpdate) {
        throw new BadRequestException(
          '보상 지급 상태 변경경에 실패하였습니다.',
        );
      }

      const rewardPayment = await this.rewardPaymentDetail.create(
        rewardLog.map((data) => ({
          user_id: data?.user_id,
          event_no: data?.event_no,
          reward_no: rewardDetail[0].reward.reward_no,
          quantity: rewardDetail[0].reward.quantity,
          payment_at: new Date(),
        })),
      );

      if (!rewardPayment) {
        throw new BadRequestException('보상 지급 명단 저장에 실패하였습니다.');
      }

      const data: RewardLogParmas[] = rewardLog.map((data) => ({
        type: '보상 지급',
        user_id: data?.user_id,
        admin_id: admin_id,
        event_no: data?.event_no,
        reward_given_at: new Date(),
        reward_detail: {
          type: rewardDetail[0].reward.type,
          qauntity: rewardDetail[0].reward.quantity,
          detail: rewardDetail[0].reward.detail || null,
        },
      }));

      const log = await rewardLogHandlerMany(data);

      const saveLog = await this.rewardLog.create(log);

      if (!saveLog) {
        throw new BadRequestException('보상 지급 로그 저장에 실패하였습니다.');
      }

      return true;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }

  // 유저 리워드 요청 내역 확인
  // user_id와 event_no로 검색 가능
  // 둘 다 없을 경우에는 모든 요청을 보여줌
  async readRewardLog(readRewardLogDto: ReadRewardLogDto) {
    try {
      const filter: Record<string, number> = {};
      if (readRewardLogDto?.event_no) {
        filter.event_no = Number(readRewardLogDto?.event_no);
      }
      if (readRewardLogDto?.user_id) {
        filter.user_id = Number(readRewardLogDto?.user_id);
      }
      const rewardLog = await this.userRewardLog.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'event',
            localField: 'event_no',
            foreignField: 'event_no',
            as: 'eventInfo',
          },
        },
        {
          $unwind: '$eventInfo',
        },
        {
          $project: {
            _id: 0,
            user_id: 1,
            event_no: 1,
            'eventInfo.classification': 1,
            'eventInfo.title': 1,
            'eventInfo.condition': 1,
            reward_given: 1,
            created_at: 1,
          },
        },
      ]);
      if (!rewardLog || rewardLog.length === 0) {
        throw new BadRequestException('요청 내역이 없습니다.');
      }
      return rewardLog;
    } catch (e) {
      console.error(e);
      throw new BadRequestException(e.message);
    }
  }
}
