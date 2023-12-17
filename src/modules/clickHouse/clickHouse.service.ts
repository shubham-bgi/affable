import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ClickHouse } from "clickhouse";
import { mapKeys, camelCase } from "lodash";
import { createClient, DataFormat } from "@clickhouse/client";

const TAG = "CLICKHOUSE_SERVICE";

@Injectable()
export class ClickHouseService {
  constructor(private configService: ConfigService) {}
  private clickHouse = new ClickHouse({
    url: this.configService.get("CLICKHOUSE_HOST"),
    port: this.configService.get("CLICKHOUSE_PORT"),
    format: "json",
    basicAuth: {
      username: this.configService.get("CLICKHOUSE_USER"),
      password: this.configService.get("CLICKHOUSE_PASSWORD"),
    },
    config: {
      database: this.configService.get("CLICKHOUSE_DATABASE"),
    },
  });

  private client = createClient({
    host:
      "http://" +
      this.configService.get("CLICKHOUSE_HOST") +
      ":" +
      this.configService.get("CLICKHOUSE_PORT"),
    username: this.configService.get("CLICKHOUSE_USER"),
    password: this.configService.get("CLICKHOUSE_PASSWORD"),
    // database: 'local'
  });

  async selectQuery(serviceTag: string, query: string, params): Promise<any[]> {
    let res = await this.query(serviceTag, query, params);
    res = res?.map((row) => mapKeys(row, (value, key) => camelCase(key)));
    return res;
  }

  async query(serviceTag: string, query: string, params) {
    console.log(TAG, serviceTag, query, JSON.stringify(params));
    return await this.clickHouse.query(query, { params }).toPromise();
  }

  async bulkInsert(
    serviceTag: string,
    table: string,
    values: any[],
    format: DataFormat = "JSONEachRow"
  ) {
    // console.log(TAG, serviceTag, "bulkInsert", JSON.stringify(values));
    return await this.client.insert({
      table,
      values,
      format,
    });
  }
}
