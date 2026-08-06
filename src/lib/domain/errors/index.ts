export class DomainError extends Error {
  public readonly code: string;
  public readonly isDomainError = true;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class ConcurrencyConflictError extends DomainError {
  constructor(
    message: string = 'The resource was modified by another transaction. Please retry.'
  ) {
    super(message, 'CONCURRENCY_CONFLICT');
  }
}

export class LockAcquisitionError extends DomainError {
  constructor(
    message: string = 'Could not acquire distributed lock for resource.'
  ) {
    super(message, 'LOCK_ACQUISITION_FAILED');
  }
}

export class AvailabilityConflictError extends DomainError {
  constructor(message: string = 'The selected dates are no longer available.') {
    super(message, 'AVAILABILITY_CONFLICT');
  }
}

export class PaymentAuthorizationError extends DomainError {
  constructor(message: string = 'Payment authorization failed.') {
    super(message, 'PAYMENT_AUTHORIZATION_FAILED');
  }
}

export class BookingStateTransitionError extends DomainError {
  constructor(message: string) {
    super(message, 'INVALID_STATE_TRANSITION');
  }
}

export class ResourceNotFoundError extends DomainError {
  constructor(message: string) {
    super(message, 'RESOURCE_NOT_FOUND');
  }
}
