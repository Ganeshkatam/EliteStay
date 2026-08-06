'use client';

import React from 'react';
import { ResidentViewModel } from '../../api/resident-view-model.types';
import { MapPin, Info, Zap } from 'lucide-react';

interface Props {
  property: NonNullable<ResidentViewModel['property']>;
}

export function PropertyInformationWidget({ property }: Props) {
  return (
    <div className="bg-white shadow sm:rounded-lg overflow-hidden border border-gray-200">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
          <MapPin className="mr-2 h-5 w-5 text-gray-400" />
          Property Details
        </h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-sm font-medium text-gray-900 flex items-center mb-3">
              <Info className="mr-2 h-4 w-4 text-gray-400" />
              House Rules
            </h4>
            {property.houseRules && property.houseRules.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {property.houseRules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No specific house rules recorded.
              </p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 flex items-center mb-3">
              <Zap className="mr-2 h-4 w-4 text-gray-400" />
              Included Utilities
            </h4>
            {property.utilitiesIncluded &&
            property.utilitiesIncluded.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                {property.utilitiesIncluded.map((util, idx) => (
                  <li key={idx}>{util}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Tenant is responsible for all utilities.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
