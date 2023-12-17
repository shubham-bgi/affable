import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FollowerService } from "./follower.service";
import { EnQueueDto } from "./task.dto";

@ApiTags("follower")
@Controller("follower")
export class FollowerController {
  constructor(private readonly followerService: FollowerService) {}

  @Post("cron")
  run(@Body() enQueueDto: EnQueueDto) {
    return this.followerService.enQueueTasks(enQueueDto);
  }
}
