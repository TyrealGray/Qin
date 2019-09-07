//@flow

import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';

import DBError from './DBError';

type DBClientPropsType = {
	name: string,
};

class DBClient {
	_db: PouchDB;
	_name: string;

	constructor(props: DBClientPropsType) {
		this._name = props.name;
		this._db = new (PouchDB.plugin(PouchDBFind))(props.name, {
			revs_limit: 1,
		});
	}

	async _get(name: string): Promise<any> {
		return new Promise((resolve, reject) => {
			this._db
				.get(name)
				.then((doc) => {
					return resolve(doc);
				})
				.catch((e) => {
					return reject(new DBError(e));
				});
		});
	}

	async query(value): Promise<any> {
		try {
			return await this._get(value);
		} catch (e) {
			if (e.name === 'DBError' && e.status === 404) {
				return;
			}

			console.log(e);
		}
	}

	async update(value, content): Promise<any> {
		let doc = await this.query(value);
		const updateContent = doc
			? {
					_rev: doc._rev,
					...content,
			  }
			: content;

		return await this._db.put({
			_id: value,
			...updateContent,
		});
	}
}

export default DBClient;
