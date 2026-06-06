import { BadRequestException } from '@nestjs/common';
import { RaidbotsDataJson, ValidatedRaidbotsData } from './interfaces/raidbots-data.interface';

/**
 * Validates a parsed Raidbots /data.json response.
 * Throws BadRequestException with a descriptive message if any required
 * field is missing or empty.
 */
export function validateRaidbotsResponse(data: RaidbotsDataJson): ValidatedRaidbotsData {
  const player = data.sim?.players?.[0];
  if (!player) {
    throw new BadRequestException(
      'Invalid report data: missing sim.players[0] — no player data found in report.',
    );
  }

  if (!player.collected_data?.dps?.mean) {
    throw new BadRequestException(
      `Invalid report data: missing player DPS mean for "${player.name}".`,
    );
  }

  const profileSets = data.sim.profilesets?.results;
  if (!profileSets || profileSets.length === 0) {
    throw new BadRequestException(
      'Invalid report data: missing or empty sim.profilesets.results — no profile set data to compare.',
    );
  }

  const droptimizerItems = data.simbot?.meta?.rawFormData?.droptimizerItems;
  if (!droptimizerItems || droptimizerItems.length === 0) {
    throw new BadRequestException(
      'Invalid report data: missing or empty simbot.meta.rawFormData.droptimizerItems — no items to evaluate.',
    );
  }

  return {
    player: {
      name: player.name,
      spec: player.specialization,
    },
    playerDpsMean: player.collected_data.dps.mean,
    profileSets,
    droptimizerItems,
  };
}
