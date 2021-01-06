//@flow
import Perlin from 'perlin.js';
import { NPC_REACTION, REACTION } from './shuoCore/reactionType';
import randomSeed from './shuoCore/randomSeed';

export const checkChance = (data: Object, stamp: {seed: string, time: number}, reaction: Object):boolean => {
	randomSeed.setSeed(stamp.seed);
	const randomBySeed = randomSeed.random();
	const randomByDate = randomSeed.randomByDate();
	randomSeed.setSeed(data.qinId);
	const randomByData = randomSeed.random();
	Perlin.seed(randomByData);
	const noise = Perlin.perlin3(randomBySeed, randomByDate, stamp.time.toFixed(2));

	const chance = ((noise + 1.0) / 2.0).toFixed(2);

	return (chance <= reaction.rate);
};

const walk = (data: Object):Object => {
	return data;
};

export const processReaction = (stamp: {seed: string, time: number}, reactions:Object, data: Object):Object => {

	for (const reaction of reactions) {
		switch (reaction.type) {
			case REACTION.ADD:
				data[reaction.attribute] += reaction.value;
				break;
			case REACTION.MAYBE_ADD:
				if(checkChance(data, stamp, reaction)){
					data[reaction.attribute] += reaction.value;
				}
				break;
			case REACTION.SET:
				data[reaction.attribute] = reaction.value;
				break;
			case REACTION.MAYBE_SET:
				if(checkChance(data, stamp, reaction)){
					data[reaction.attribute] = reaction.value;
				}
				break;
			case NPC_REACTION.WALK:

				break;
		}
	}
	return data;
};
