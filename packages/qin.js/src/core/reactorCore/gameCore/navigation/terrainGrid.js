//@flow
import Cube from './cube';
import Coordinates from './coordinates';
import Grid from './grid';

import TerrainChain from './terrainChain';

type TerrainGridPropsType = {
	point: Coordinates,
};

const ODD_Q_DIRECTIONS = [
	[[+1, 0], [+1, -1], [0, -1], [-1, -1], [-1, 0], [0, +1]],
	[[+1, +1], [+1, 0], [0, -1], [-1, 0], [-1, +1], [0, +1]],
];

/**
 * class of terrain grid which provide navigation algorithm for terrain
 * @extends Grid
 */
class TerrainGrid extends Grid {
	/**
	 * create a terrain grid
	 * @param props {Object}
	 * @param props.point {Coordinates} position on terrain
	 */
	constructor(props: TerrainGridPropsType) {
		super(props);
	}

	/**
	 * convert to cube Coordinates system
	 * @returns {Cube}
	 */
	convertToCube(): Cube {
		let z = this._point.y - (this._point.x - (this._point.x & 1)) / 2;
		let y = -this._point.x - z;
		return new Cube(this._point.x, y, z);
	}

	/**
	 * get neighbor grid
	 * @returns {Array}
	 */
	getNeighbors(): Array<Grid> {
		const neighborGrids = [];

		for (const point of this.getNeighborsPoints()) {
			neighborGrids.push(new TerrainGrid({ point: point }));
		}

		return neighborGrids;
	}

	getNeighborsPoints(isIgnoredBlocking: boolean = false): Array<Coordinates> {
		const currentPoint = this._point;

		const directionSet = ODD_Q_DIRECTIONS[currentPoint.x & 1];

		const neighborPoints = [];

		for (const direction of directionSet) {
			const point = new Coordinates(
				currentPoint.x + direction[0],
				currentPoint.y + direction[1],
			);

			const { height } = TerrainChain.getTerrainNavigationInfo(point);

			if (!isIgnoredBlocking && height > 150) {
				continue;
			}

			neighborPoints.push(point);
		}

		return neighborPoints;
	}

	/**
	 * get distance to cube
	 * @param grid {Grid}
	 * @returns {number}
	 */
	distanceTo(grid: Grid): number {
		const gridToCube = grid.convertToCube();
		return this.convertToCube().distanceTo(gridToCube);
	}
}

export default TerrainGrid;
