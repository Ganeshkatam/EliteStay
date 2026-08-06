import { observeService } from '@/lib/observability/decorators/observe-service';
import { HostApplicationRepository } from '../repositories/host-application.repository';
import { HostApplicationViewModel } from '../view-models/application.view-model';
import { RentalApplicationStatus } from '@/features/application/types/application.types';
import { ApplicationService } from '@/features/application/services/application.service';

export class HostApplicationService {
  static async getDashboard(
    hostId: string
  ): Promise<HostApplicationViewModel[]> {
    return observeService(
      'HostApplicationService',
      'getDashboard',
      async () => {
        const applications =
          await HostApplicationRepository.getPendingApplicationsForHost(hostId);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return applications.map((app: any): HostApplicationViewModel => {
          // Handle relation shape differences
          const profile = Array.isArray(app.applicant_profiles)
            ? app.applicant_profiles[0]
            : app.applicant_profiles;
          const listing = Array.isArray(app.listings)
            ? app.listings[0]
            : app.listings;
          const guestData = Array.isArray(app.guest) ? app.guest[0] : app.guest;

          // Default expiry to 7 days from creation
          const createdDate = new Date(app.created_at);
          const expiresDate = new Date(
            createdDate.getTime() + 7 * 24 * 60 * 60 * 1000
          );

          return {
            id: app.id,
            status: app.status as RentalApplicationStatus,
            listing: {
              id: app.property_id,
              title: listing?.title || 'Unknown Property',
              imageUrl: listing?.cover_image || null,
            },
            applicant: {
              id: app.guest_id,
              name: guestData
                ? `${guestData.first_name} ${guestData.last_name}`
                : 'Unknown Applicant',
              avatarUrl: guestData?.avatar_url || null,
              employmentStatus: profile?.employment_status || null,
              incomeRange: profile?.income_range || null,
              studentStatus: profile?.student_status || null,
              petInformation: profile?.pet_information || null,
              guarantorInformation: profile?.guarantor_information || null,
            },
            moveInDate: app.move_in_date,
            leaseDurationMonths: app.lease_duration_months,
            submittedAt: app.created_at,
            expiresAt: expiresDate.toISOString(),
            actions: {
              canApprove: app.status === 'UNDER_REVIEW',
              canReject: app.status === 'UNDER_REVIEW',
            },
          };
        });
      }
    );
  }

  static async approveApplication(
    applicationId: string,
    hostId: string
  ): Promise<void> {
    return observeService(
      'HostApplicationService',
      'approveApplication',
      async () => {
        await ApplicationService.approve(applicationId, hostId);
      }
    );
  }

  static async rejectApplication(
    applicationId: string,
    hostId: string
  ): Promise<void> {
    return observeService(
      'HostApplicationService',
      'rejectApplication',
      async () => {
        await ApplicationService.reject(applicationId, hostId);
      }
    );
  }
}
