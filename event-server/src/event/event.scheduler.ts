import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { EventDocument } from 'src/schema/event.schema';

// 스케줄러 (5분마다 실행)
// 현재 시간을 비교하여 활성/비활성화 상태로 변경
@Injectable()
export class EventScheduler {
  private readonly logger = new Logger(EventScheduler.name);

  constructor(
    @InjectModel(Event.name)
    private readonly event: Model<EventDocument>,
  ) {}

  @Cron('*/5 * * * *')
  async handleCron() {
    this.logger.debug('이벤트 상태 업데이트');

    const date = new Date();

    const activeEvents = await this.event.updateMany(
      { start_at: { $lt: date }, end_at: { $gt: date }, state: { $ne: true } },
      { state: true },
    );

    const inactiveEvents = await this.event.updateMany(
      { start_at: { $gt: date }, end_at: { $lt: date }, state: { $ne: false } },
      { state: false },
    );

    this.logger.log(
      `활성화된 이벤트 수 : ${activeEvents.modifiedCount}, 비활성화된 이벤트 수 : ${inactiveEvents.modifiedCount}`,
    );
  }
}
