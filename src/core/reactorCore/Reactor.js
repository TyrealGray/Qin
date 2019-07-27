//@flow
import { version } from '../../../package.json';

import Shuo from '../shuoCore/Shuo';
import DBClient from '../dbCore/DBClient';

const QINJS_Version = 'QINJS_Version';

class Reactor {
	_name: string;
	_shuo: Shuo;
	_dbCore: DBClient;

	constructor(props: { name: string }) {
		this._name = props.name;
		this._shuo = new Shuo();
	}

	async init(): Promise<void> {
		try {
			await this._initShuo();
			this._initPouchDB();

			if (!(await this._isSameVersion())) {
				await this._initReactorChain();
			}
		} catch (e) {
			console.error(e);
		}
	}

	async getData(): Promise<Object> {
		return { content: await this._dbCore.found('content') };
	}

	async _initReactorChain(): Promise<void> {
		await this._dbCore.update(QINJS_Version, { number: 0 });
		await this._dbCore.update('content', this._shuo.getContent());
	}

	async _initShuo(): Promise<void> {
		await this._shuo.init();
	}

	_initPouchDB(): void {
		this._dbCore = new DBClient({ name: `QINJS_${this._name}_DB` });
	}

	async _isSameVersion(): Promise<boolean> {
		try {
			const versionDoc = await this._dbCore.found(QINJS_Version);
			if (versionDoc) {
				return versionDoc.number === version;
			}

			return false;
		} catch (e) {
			console.error(e);
		}
	}

	loadExtra(extra: Object) {
		this._shuo.loadExtra(extra);
	}
}

export default Reactor;
