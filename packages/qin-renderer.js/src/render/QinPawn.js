//@flow

type PawnProps = {
	character: Object;
}

/**
 * a class for pawn in game that player could control
 */
class QinPawn {

	_character: Object;

	/**
	 * create a pawn in game
	 * @param props
	 */
	constructor(props: PawnProps) {
		this._character = props.character;
	}

	/**
	 * get the character instance
	 * @returns {QinActor}
	 */
	getCharacter(): Object {
		return this._character;
	}

	onMouseDown(e: Object) {
		//const {layerX, layerY} = e;
		//this._character.moveTo({x: layerX, y: layerY});
	}

	onMouseUp(e: Object) {
		//const {layerX, layerY} = e;
		//this._character.moveTo({x: layerX, y: layerY});
	}

	onMouseClick(hexagon: Object) {
		this._character.navigateTo(hexagon.getGrid());
	}

	onPressKeyA(e: Object) {
		this._character.playAttack();
	}

	onPressKeyB(e: Object) {
		this._character.playBattle();
	}

	onPressKeyD(e: Object) {
		this._character.playNearDeath();
	}

	onPressKeyU(e: Object) {
		this._character.playUltimate();
	}
}

export default QinPawn;