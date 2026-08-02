import {
  MissingItem,
  PublishingDecision,
  PublishingSectionId,
} from '../view-models/listing-publishing.viewmodel';

export class PublishingPolicy {
  static evaluate(missingItems: MissingItem[]): PublishingDecision {
    const required = missingItems.filter(
      (item) => item.category === 'required'
    );
    const recommended = missingItems.filter(
      (item) => item.category === 'recommended'
    );
    const optional = missingItems.filter(
      (item) => item.category === 'optional'
    );

    const ready = required.length === 0;

    // Determine the next section they should visit to fix the first requirement
    let nextRequiredSection: PublishingSectionId | undefined;
    if (!ready) {
      nextRequiredSection = required[0].sectionId;
    }

    return {
      ready,
      required,
      recommended,
      optional,
      nextRequiredSection,
    };
  }
}
