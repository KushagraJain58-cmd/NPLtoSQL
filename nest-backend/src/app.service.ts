/* eslint-disable prettier/prettier */
// A basic service with a single method.
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';
import * as DuckDB from 'duckdb';

@Injectable()
export class AppService {
  private readonly db: DuckDB.Database;
  private readonly connection: DuckDB.Connection;
  private readonly client: OpenAI;
  private tableName: string = '';

  constructor(private configService: ConfigService) {
    this.db = new DuckDB.Database('database.duckdb');
    this.connection = this.db.connect();
    Logger.log('Connected to DuckDB')
    // console.log('Connected to DuckDB');

    this.client = new OpenAI();
    this.client.apiKey = this.configService.get<string>('OPENAI_API_KEY');
  }

  async executeQuery(sqlQuery: string): Promise<any> {
    try {
      // Ensure no active transaction exists
      await this.connection.run('COMMIT;');

      return await new Promise((resolve, reject) => {
        this.connection.all(sqlQuery, (err, res) => {
          if (err) {
            console.warn('Query error', err);
            reject(err);
            return; // Exit early to avoid further execution
          }

          // Log raw result for debugging
          console.debug('Raw Query Result:', res);

          try {
            const sanitizedResult = res.map((row: any) =>
              Object.fromEntries(
                Object.entries(row).map(([key, value]) => [
                  key,
                  typeof value === "bigint" ? value.toString() : value,
                ])
              )
            );

            // Logger.log('Sanitized Result:', sanitizedResult);
            // resolve(sanitizedResult);
            // Convert sanitized result to JSON format
            const jsonResult = JSON.stringify(sanitizedResult);

            Logger.log('Sanitized JSON Result:', jsonResult);
            resolve(jsonResult);
          } catch (serializationError) {
            Logger.error('Serialization failed:', serializationError);
            reject(new Error('Serialization error during result sanitization.'));
          }
        });
      });
    } catch (error) {
      Logger.error('Error executing query:', error);
      throw new Error(`Query execution failed: ${error.message}`);
    }
  }



  async healthCheck(): Promise<any> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Write a haiku about recursion in programming.' },
      ],
    });
    return response;
  }

  async dropTable(tableName: string): Promise<string> {
    const tableExists: any = await this.executeQuery(
      `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = '${tableName}'`
    );

    if (tableExists[0].count === 0) {
      throw new HttpException(`Table "${tableName}" does not exist.`, HttpStatus.BAD_REQUEST);
    }

    this.connection.run(`DROP TABLE ${tableName}`);
    return `Table "${tableName}" dropped successfully.`;
  }

  async dropAllTables(): Promise<string> {
    try {
      // Fetch all table names
      const tables: any[] = await this.executeQuery(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'`
      );

      if (tables.length === 0) {
        return 'No tables exist to be dropped.';
      }

      // Drop each table
      for (const table of tables) {
        const tableName = table.table_name;
        await this.connection.run(`DROP TABLE IF EXISTS ${tableName}`);
        Logger.log(`Dropped table: ${tableName}`);
      }

      return 'All tables dropped successfully.';
    } catch (err) {
      Logger.error('Error dropping tables:', err);
      throw new HttpException('Failed to drop all tables.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async uploadCSV(filePath: string): Promise<string> {
    this.tableName = `uploaded_data_${Date.now()}`;
    this.connection.run(
      `CREATE TABLE ${this.tableName} AS SELECT * FROM read_csv_auto('${filePath}')`
    );

    for (let i = 0; i < 10; i++) {
      this.connection.run(`INSERT INTO ${this.tableName} SELECT * FROM ${this.tableName}`);
    }
    Logger.log("Table name: ", this.tableName)
    return this.tableName;
  }

  async queryData(naturalLanguageQuery: string): Promise<any> {
    if (!this.tableName) {
      throw new HttpException('No table available. Please upload a CSV first.', HttpStatus.BAD_REQUEST);
    }

    const removedString = "```sql```"
    const prompt = `
      Convert the following natural language query into an SQL query for DuckDB:
      Table name: ${this.tableName}
      Query: "${naturalLanguageQuery}"
      IMPORTANT: "Return only the SQL query as plain text, without any additional formatting such as ${removedString} or explanations. Do not include any prefix or suffix, just the raw SQL query. For example: SELECT * FROM tableName LIMIT 5.
  Take column headings as they are without adding or removing characters or spaces."
    `;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const sqlQuery = response.choices[0]?.message?.content?.trim();
    Logger.log("Query:", sqlQuery)

    if (!sqlQuery) {
      throw new HttpException('Failed to generate SQL query.', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // const verifyQuery = `SELECT table_name FROM information_schema.tables WHERE table_name = '${this.tableName}'`;
    // const verifyResult = await this.executeQuery(verifyQuery);
    // if (verifyResult.length === 0) {
    //   throw new Error(`Table "${this.tableName}" was not properly registered.`);
    // }
    const result: any = await this.executeQuery(sqlQuery);
    Logger.log("Result:", result)
    // const result = sqlQuery
    return { query: sqlQuery, result, length: result.length };
  }
}