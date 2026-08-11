import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { TripStatus, TRIP_TRANSITIONS } from './entities/trip.entity';

/**
 * Enforces the trip status state machine.
 * All status transitions MUST go through this service.
 * Invalid transitions return 422 with a machine-readable code.
 */
@Injectable()
export class TripStateService {
  /**
   * Validates a requested status transition.
   * Throws UnprocessableEntityException if transition is not allowed.
   */
  validateTransition(currentStatus: TripStatus, nextStatus: TripStatus): void {
    const allowed = TRIP_TRANSITIONS[currentStatus];

    if (!allowed.includes(nextStatus)) {
      throw new UnprocessableEntityException({
        message: `Cannot transition trip from '${currentStatus}' to '${nextStatus}'`,
        code: 'INVALID_TRIP_TRANSITION',
        details: {
          currentStatus,
          requestedStatus: nextStatus,
          allowedTransitions: allowed,
        },
      });
    }
  }

  /**
   * Returns allowed next statuses for a given status.
   */
  getAllowedTransitions(currentStatus: TripStatus): TripStatus[] {
    return TRIP_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Checks if a trip can be modified (only draft/assigned trips can be edited).
   */
  canEdit(status: TripStatus): boolean {
    return [TripStatus.DRAFT, TripStatus.ASSIGNED].includes(status);
  }

  /**
   * Checks if a trip can be cancelled.
   */
  canCancel(status: TripStatus): boolean {
    return ![TripStatus.COMPLETED, TripStatus.CANCELLED].includes(status);
  }
}
