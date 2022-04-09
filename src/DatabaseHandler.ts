import Database, { RunResult } from "better-sqlite3";
const db = new Database("database.db", { verbose: console.log });

export default class DatabaseHandler {
    constructor(time: number) {
        this.createTable();
        setInterval(() => {
            try {
                const deleteStatement = db.prepare('DELETE FROM responses WHERE date < @date');
                deleteStatement.run({ date: Date.now() - time });
            } catch (e) {
            }
        }, time * 10 * 1000);
    }

    createTable(): RunResult {
        const createTableStatement = db.prepare('CREATE TABLE IF NOT EXISTS responses (link TEXT, buffer BUFFER, type TEXT, date INTEGER)');
        return createTableStatement.run();
    }

    addResponse(link: string, buffer: Buffer, type: string, date = Date.now()): RunResult {
        const insert = db.prepare('INSERT INTO responses (link, buffer, type, date) VALUES (@link, @buffer, @type, @date)');
        return insert.run({ link, buffer, type, date });
    }

    getResponse(link: string) {
        const select = db.prepare('SELECT * FROM responses WHERE link = @link');
        return select.get({ link });
    }

    deleteResponse(link: string): RunResult {
        const deleteStatement = db.prepare('DELETE FROM responses WHERE link = @link');
        return deleteStatement.run({ link });
    }
}