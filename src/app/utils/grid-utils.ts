import { TILE_SIZE } from '../../config';
import { Coordinate } from '../../game/battle/types/monster-types';
import { DIRECTION, Direction } from '../../game/shared/direction';
import { exhaustiveGuard } from './guard';

export function getTargetPositionFromGameObjectPositionAndDirection(
  currentPosition: Coordinate,
  direction: Direction
): Coordinate {
  const targetPosition: Coordinate = { ...currentPosition };
  switch (direction) {
    case DIRECTION.DOWN:
      targetPosition.y += TILE_SIZE;
      break;
    case DIRECTION.UP:
      targetPosition.y -= TILE_SIZE;
      break;
    case DIRECTION.LEFT:
      targetPosition.x -= TILE_SIZE;
      break;
    case DIRECTION.RIGHT:
      targetPosition.x += TILE_SIZE;
      break;
    case DIRECTION.NONE:
      break;
    default:
      exhaustiveGuard(direction);
  }

  return targetPosition;
}
