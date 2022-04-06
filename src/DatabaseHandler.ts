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
        const createTableStatement = db.prepare('CREATE TABLE IF NOT EXISTS responses (link TEXT, response TEXT, date INTEGER)');
        return createTableStatement.run();
    }

    addResponse(link: string, response: string, date = new Date()): RunResult {
        const insert = db.prepare('INSERT INTO responses (link, response, date) VALUES (@link, @response, @date)');
        return insert.run({ link, response, date });
    }

    getResponse(link: string): RunResult {
        const select = db.prepare('SELECT response FROM responses WHERE link = @link');
        return select.get({ link });
    }

    deleteResponse(link: string): RunResult {
        const deleteStatement = db.prepare('DELETE FROM responses WHERE link = @link');
        return deleteStatement.run({ link });
    }
}