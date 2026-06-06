import { DropOptimizerItem } from './raidbots-dropoptimizeritem.interface';
import { RaidbotsPlayer } from './raidbots-player.interface';
import {
  DropOptimizerRaidbotsProfileSets,
  DropOptimizerResultsItem,
} from './raidbots-profilesets.interface';

/**
 * Expected shape of the Raidbots /data.json response.
 * Only the relevant properties are typed; the rest is `unknown`.
 */
export interface RaidbotsDataJson {
  sim: {
    players: Array<RaidbotsPlayer>;
    profilesets: DropOptimizerRaidbotsProfileSets;
    statistics: object;
    targets: Array<object>;
    sim_auras: Array<object>;
  };
  simbot: {
    meta: {
      rawFormData: {
        droptimizerItems?: Array<DropOptimizerItem>;
      };
    };
  };
}

/** Validated result from a Raidbots report response. */
export interface ValidatedRaidbotsData {
  player: {
    name: string;
    spec: string;
  };
  playerDpsMean: number;
  profileSets: Array<DropOptimizerResultsItem>;
  droptimizerItems: Array<DropOptimizerItem>;
}
