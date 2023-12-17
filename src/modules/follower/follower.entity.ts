import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
export const FOLLOWER_QUEUE = "follower";

@Entity({ name: "follower" })
export class Follower {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: () => 0 })
  username: string;

  @Column({ default: () => 0 })
  currentFollowerCount: number;

  @Column({ default: () => 0 })
  currentFollowingCount: number;

  @Column({ default: () => 0 })
  averageFollowerCount: number;

  @Column({ default: () => 0 })
  totalRecords: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: string;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
  })
  updatedAt: string;
}
