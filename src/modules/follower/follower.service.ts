import {
  InjectQueue,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from "@nestjs/bull";
import {
  CACHE_MANAGER,
  HttpException,
  HttpService,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FOLLOWER_QUEUE, Follower } from "./follower.entity";
import { Job, Queue } from "bull";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Cache } from "cache-manager";
import { EnQueueDto } from "./task.dto";
import { ClickHouseService } from "../clickHouse/clickHouse.service";
import * as moment from "moment";

interface response {
  pk: number;
  username: string;
  followerCount: number;
  followingCount: number;
  timestamp: number;
}
const TAG = "FOLLOWER_SERVICE";

@Processor(FOLLOWER_QUEUE)
@Injectable()
export class FollowerService {
  constructor(
    @InjectRepository(Follower)
    private readonly followerRepository: Repository<Follower>,
    @InjectQueue(FOLLOWER_QUEUE)
    private readonly followerQueue: Queue<number[]>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly clickhouse: ClickHouseService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  async enQueueTasks(enQueueDto: EnQueueDto) {
    try {
      const start = enQueueDto.start || +this.configService.get("PK_START");
      const end = enQueueDto.end || +this.configService.get("PK_END");
      const batch = enQueueDto.batch || +this.configService.get("BATCH_SIZE");
      const timestamp = moment().unix();

      for (let i = start; i < end; i += batch) {
        const arr = Array.from({ length: batch }, (value, index) => i + index);
        arr.push(timestamp);
        await this.followerQueue.add(arr, {
          removeOnComplete: true,
          removeOnFail: 100,
        });
      }
      return "Succesfully added";
    } catch (err) {
      console.error(TAG, "error enquing tasks", err);
      throw new HttpException(
        "Failed adding tasks",
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Process()
  async processTasks(job: Job<number[]>) {
    try {
      const timestamp = job.data.pop();
      const dataPromises = job.data.map((id) => this.update(id, timestamp));
      const data = await Promise.allSettled(dataPromises);
      const values = data
        .filter((item) => item.status == "fulfilled")
        .map((item) => {
          if (item.status == "fulfilled") return item.value;
        });
      await this.clickhouse.bulkInsert(TAG, "local.follower", values);
    } catch (err) {
      console.error(TAG, this.jobRange(job), err);
      throw err;
    }
  }

  @OnQueueCompleted()
  onCompleted(job: Job<number[]>) {
    console.log(TAG, job.id, this.jobRange(job), "completed.");
  }

  @OnQueueFailed()
  onFailed(job: Job<number[]>, err: Error) {
    console.error(TAG, job.id, this.jobRange(job), "failed with error", err);
  }

  jobRange(job: Job<number[]>) {
    return `${job.data[0]} ${job.data[job.data.length - 1]}`;
  }

  async getInfluencerData(id: number): Promise<response> {
    const url = this.configService.get("INFULENCER_API_URL") + id;
    const data = await this.httpService.get(url).toPromise();
    return data.data;
  }

  async update(id: number, timestamp: number) {
    try {
      const res = await this.getInfluencerData(id);
      if (!res || !res.pk) {
        console.error("Failed fetching from api for id", id);
        throw `Failed fetching from api ${id}`;
      }
      const { pk, followerCount, followingCount, username } = res;

      let follower = await this.getFollower(id);
      follower.id = pk;
      follower.currentFollowerCount = followerCount;
      follower.currentFollowingCount = followingCount;
      follower.username = username;
      if (follower.averageFollowerCount) {
        const oldSum = follower.averageFollowerCount * follower.totalRecords;
        follower.averageFollowerCount =
          (oldSum + followerCount) / ++follower.totalRecords;
      } else {
        follower.totalRecords = 1;
        follower.averageFollowerCount = followerCount;
      }
      await this.setFollower(follower);
      res.timestamp = timestamp;
      return res;
    } catch (err) {
      console.error("Error in update", err.message);
      throw err;
    }
  }
  async getFollower(id: number): Promise<Follower> {
    const key = this.getKey(id);
    let follower = (await this.cacheManager.get(key)) as Follower;
    // if (!follower) {
    //   follower = await this.followerRepository.findOne({ id });
    // }
    return follower || ({} as Follower);
  }

  async setFollower(follower: Follower) {
    const key = this.getKey(follower.id);
    await this.cacheManager.set(key, follower);
    // this.saveFollowerToDB(follower);
  }

  async saveFollowerToDB(follower: Follower) {
    await this.followerRepository.save(follower);
  }

  getKey(id: number) {
    return "pk_" + id;
  }
}
