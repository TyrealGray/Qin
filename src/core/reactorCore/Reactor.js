//@flow
import { version } from '../../../package.json';

import Shuo from './shuoCore/Shuo';
import DBClient from './dbCore/DBClient';
import { initStore } from './reduxCore/storeUtil';
import {
	storeConnectReactor,
	storeInit,
} from './reduxCore/actions/storeActions';

const QINJS_Version = {system:'QINJS_Version'};
const REACTOR_CONTENT = {system:'REACTOR_CONTENT'};
const SHUO_RULE = {system:'SHUO_RULE'};

type ReactorPropsType = {
	name: string,
	debugging?: boolean,
};

class Reactor {
	_name: string;
	_debugging: boolean;
	_shuo: Shuo;
	_store: ReduxStore;
	_dbCore: DBClient;
	_timerId: TimeoutID;
	_storeData: Object;
	_performanceTicker: PerfHooks | Performance;

	constructor(props: ReactorPropsType) {
		this._shuo = new Shuo();
		this._name = props.name;
		this._debugging = props.debugging || false;
		this._performanceTicker =
			typeof performance !== 'undefined'
				? performance
				: require('perf_hooks').performance;
	}

	async init(): Promise<void> {
		try {
			await this._initShuo();
			this._initPouchDB();
			this._initRedux(this._debugging);

			if (!(await this._isSameVersion())) {
				await this._initReactorChain();
			}

			if (!(await this._hasContent())) {
				await this._initReactorContent();
			}
		} catch (e) {
			console.error(e);
		}
	}

	syncStoreToDBCore(): void {
		this._store.subscribe(() => {
			this._storeData = this._store.getState();
		});
	}

	async update(delta: number, tick: number): Promise<void> {
		// console.log(delta);
		const { terrainInfo } = this._storeData;
		//await this._dbCore.update(REACTOR_CONTENT, { characterInfo, terrainInfo });
		const rules = await this.getRules();

		for(const rule of rules.terrains){
			if(terrainInfo.terrains[0].type === rule.attribute.type){

				for (const trigger of rule.eventTriggers){
					if(trigger.condition.moreThan[0].size.height < terrainInfo.terrains[0].size.height){
						const rate = Math.random();
						if(rate > trigger.rate){
							await this._store.dispatch({type: trigger.name});
						}
					}
				}
			}
		}

		this._timerId = setTimeout(async () => {
			await this.update(this._performanceTicker.now() - tick, this._performanceTicker.now());
		}, 50);
	}

	async start(): Promise<void> {
		try {
			this._storeData = await this.getData();
			this.syncStoreToDBCore();

			this._timerId = setTimeout(async () => {
				await this.update(0, 0);
			}, 50);

			await this._store.dispatch(storeConnectReactor(this._storeData));
		} catch (e) {
			console.error(e);
		}
	}

	async stop(): Promise<void> {
		try {
			clearTimeout(this._timerId);
		} catch (e) {
			console.error(e);
		}
	}

	_initRedux(debugging: boolean): void {
		this._store = initStore(debugging);
		this._store.dispatch(storeInit());
	}

	async getData(): Promise<Object> {
		const data = await this._dbCore.queryOne(REACTOR_CONTENT);
		console.log('data',data);
		return data.value;
	}

	async getRules(): Promise<Object> {
		const rules = await this._dbCore.queryOne(SHUO_RULE);
		console.log('rules',rules);
		return rules.value;
	}

	async _initReactorChain(): Promise<void> {
		await this._dbCore.update(QINJS_Version, { ...QINJS_Version, value: 0 });
		await this._dbCore.update(SHUO_RULE, {...SHUO_RULE, value: this._shuo.getRule()});
	}

	async _initReactorContent(): Promise<void> {
		await this._dbCore.update(REACTOR_CONTENT, {...REACTOR_CONTENT, value: this._shuo.getContent()});
	}

	async _initShuo(): Promise<void> {
		await this._shuo.init();
	}

	_initPouchDB(): void {
		this._dbCore = new DBClient({ name: `QINJS_${this._name}_DB` });
	}

	async _isSameVersion(): Promise<boolean> {
		try {
			const versionDoc = await this._dbCore.queryOne(QINJS_Version);
			if (versionDoc) {
				return versionDoc.value === version;
			}

			return false;
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	async _hasContent(): Promise<boolean> {
		try {
			const hasContent = await this._dbCore.query(REACTOR_CONTENT);
			return !!hasContent.length;
		} catch (e) {
			console.error(e);
			throw e;
		}
	}

	loadExtra(extra: Object) {
		this._shuo.loadExtra(extra);
	}
}

export default Reactor;
