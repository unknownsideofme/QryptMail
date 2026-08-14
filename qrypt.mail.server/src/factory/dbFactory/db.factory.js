import PsqlDatabase from '../../db/psqldb/psqldb.js';
import MongoDatabase from '../../db/mongodb/mongodb.js';

export const DBProvider = Object.freeze({
    psql : "postgres",
    mongo : "mongo"
}); 

export class DBFactory {
    // Private static property to hold the singleton instance
    static #instance = null;

    /**
     * Returns the singleton database instance based on the type
     * @param {string} dbtype 
     * @returns {Database}
     */
    static getdb(dbtype) {
        if (!this.#instance) {
            switch(dbtype) {
                case DBProvider.psql:
                    this.#instance = new PsqlDatabase();
                    break;
                case DBProvider.mongo:
                    this.#instance = new MongoDatabase(); 
                    break;
                default:
                    throw new Error("Invalid provider");
            }
        }
        return this.#instance;
    }
}