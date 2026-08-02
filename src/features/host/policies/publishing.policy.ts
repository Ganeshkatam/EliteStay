export interface MissingItem {
  category: 'required' | 'recommended' | 'optional';
  section: 'photos' | 'pricing' | 'location' | 'amenities';
  message: string;
}

export interface PublishingDecision {
  readyToPublish: boolean;
  missingRequiredItems: MissingItem[];
  missingRecommendedItems: MissingItem[];
  missingOptionalItems: MissingItem[];
}

export class PublishingPolicy {
  static evaluate(missingItems: MissingItem[]): PublishingDecision {
    const missingRequiredItems = missingItems.filter(
      (item) => item.category === 'required'
    );
    const missingRecommendedItems = missingItems.filter(
      (item) => item.category === 'recommended'
    );
    const missingOptionalItems = missingItems.filter(
      (item) => item.category === 'optional'
    );

    return {
      readyToPublish: missingRequiredItems.length === 0,
      missingRequiredItems,
      missingRecommendedItems,
      missingOptionalItems,
    };
  }
}
