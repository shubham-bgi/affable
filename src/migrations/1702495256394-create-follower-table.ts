import { MigrationInterface, QueryRunner } from "typeorm";

export class createFollowerTable1702495256394 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                CREATE TABLE follower (
                  id INT UNSIGNED,
                  username VARCHAR(36),
                  current_follower_count INT UNSIGNED,
                  current_following_count INT UNSIGNED,
                  average_follower_count INT UNSIGNED,
                  total_records BIGINT UNSIGNED DEFAULT 1,
                  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (id)
                );
              `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE follower;");
  }
}
