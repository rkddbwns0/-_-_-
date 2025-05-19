import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { RoleGuard } from 'src/role/role.guard';
import {
  CreateEventDto,
  CreateRewardDto,
  EventPartitionDto,
  ReadRewardLogDto,
} from './event.dto';
import { Request, Response } from 'express';

@UseGuards(RoleGuard)
@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  // 이벤트 생성 controller
  @SetMetadata('permission', ['create'])
  @Post('/createEvent')
  async createEvent(
    @Body('event') createEventDto: CreateEventDto,
    @Body('reward') createRewardDto: CreateRewardDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!createEventDto || !createRewardDto)
        throw new Error('데이터가 없습니다.');
      const event = await this.eventService.createEvent(
        createEventDto,
        createRewardDto,
      );
      res
        .status(200)
        .json({ message: '이벤트 생성이 완료되었습니다.', info: event });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: e.response?.message });
    }
  }

  // 이벤트 리스트 controller (분류에 따른 리스트 호출)
  @SetMetadata('permission', ['read'])
  @Get('/eventList/:classification')
  async createReward(
    @Param('classification') classification: string,
    @Res() res,
    @Req() req,
  ) {
    try {
      const eventList = await this.eventService.eventList(classification);
      res.status(200).json({ info: eventList });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: e.response?.message });
    }
  }

  // 이벤트 참여 contoller
  @SetMetadata('permission', ['req'])
  @Post('/partitionEvent')
  async partitionEvent(
    @Body() eventPartitionDto: EventPartitionDto,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      eventPartitionDto.user_id = req.user.user_id;
      const event = await this.eventService.eventPartition(eventPartitionDto);
      res.status(200).json({ event });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.response?.message });
    }
  }

  // 이벤트 리워드 보상 요청 controller
  @SetMetadata('permission', ['req'])
  @Post('/eventReward')
  async eventReward(
    @Body('user_id') user_id: number,
    @Body('event_no') event_no: number,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      user_id = req.user.user_id;
      const reward = await this.eventService.eventReward(user_id, event_no);
      res.status(200).json({ reward });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.response?.message });
    }
  }

  // 로그인 이벤트 contoller
  @Post('/login_event')
  async login_event(
    @Body('user_id') user_id: number,
    @Body('login_at') login_at: Date,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      console.log(user_id, login_at);
      const login_log = await this.eventService.login_event(user_id, login_at);
      res.status(200).json({ login_log });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.response?.message });
    }
  }

  // 친구 초대 이벤트 contoller
  @Post('/invite_event')
  async invite_event(
    @Body('invite_code') invite_code: string,
    @Body('invited_user') invited_user: number,
    @Body('signup_at') signup_at: Date,
    @Req() req,
    @Res() res: Response,
  ) {
    console.log(invite_code, invited_user, signup_at);
    try {
      const invite_log = await this.eventService.invite_event(
        invite_code,
        invited_user,
        signup_at,
      );
      res.status(200).json({ invite_log });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.response?.message });
    }
  }

  // 보상 지급 controller
  // user_id는 userRewardPayment에서 admin_id로 받음
  @SetMetadata('permission', ['res'])
  @Post('/rewardPayment')
  async rewardPayment(
    @Body('user_id') user_id: number,
    @Body('event_no') event_no: number,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      user_id = req.admin.user_id;
      const reward = await this.eventService.userRewardPayment(
        user_id,
        event_no,
      );
      res.status(200).json({ message: '보상이 완료되었습니다.', reward });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.response?.message });
    }
  }

  // 이벤트 요청 내역 확인 (유저) controller
  // param 값으로 user_id, query 문자로 event_no를 받아옴.
  // event_no는 없어도 요청 가능하도록 구현
  @SetMetadata('permission', ['req'])
  @Get('/reqRewardLog/:user_id')
  async reqRewardLog(
    @Req() req,
    @Res() res: Response,
    @Param('user_id') user_id: number,
    @Query('evnet_no') event_no?: number,
  ) {
    try {
      const rewardLog = await this.eventService.userReadRewardLog(
        user_id,
        event_no,
      );
      res.status(200).json({ rewardLog });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: error.response?.message });
    }
  }

  // 이벤트 요청 내역 확인 (관리자) controller
  // query 문자로 user_id와 event_no를 받아옴
  // query로 받아오는 데이터가 없을 경우 모든 데이터를 보여줌
  @SetMetadata('permission', ['req_log'])
  @Get('/readRewardLog')
  async readRewardLog(
    @Query() readRewardLogDto: ReadRewardLogDto,
    @Req() req,
    @Res() res: Response,
  ) {
    try {
      const rewardLog = await this.eventService.readRewardLog(readRewardLogDto);
      res.status(200).json({ rewardLog });
    } catch (e) {
      console.error(e);
      res.status(400).json({ message: e.response?.message });
    }
  }
}
