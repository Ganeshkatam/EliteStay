import { createClient } from '@/lib/supabase/server';
import { LeaseRepository } from '../repositories/lease.repository';
import { logger } from '@/lib/observability/logging/logger';

const _logger = logger.category('BUSINESS');

export class LeaseDocumentService {
  /**
   * Generates a PDF (or structured document representation) from the Lease structured data.
   * Uploads it to Supabase Storage and returns the public URL.
   */
  static async generateAndArchive(leaseId: string): Promise<string> {
    const lease = await LeaseRepository.getById(leaseId);
    if (!lease) throw new Error('Lease not found');

    const supabase = await createClient();

    // In a real implementation, we would use a PDF generation library like PDFKit,
    // Puppeteer, or react-pdf here to generate a buffer from `lease.structuredData`.
    // For now, we simulate this by creating a text representation.

    const documentContent = `
    ELITESTAY LEASE AGREEMENT
    -----------------------------------------------------
    Lease ID: ${lease.id}
    Tenant ID: ${lease.tenantId}
    Start Date: ${lease.startDate}
    End Date: ${lease.endDate}
    Monthly Rent: ${lease.monthlyRentAmount}
    Security Deposit: ${lease.securityDepositAmount}
    
    SPECIAL CONDITIONS:
    ${lease.structuredData.specialConditions?.join('\n') || 'None'}
    
    HOUSE RULES:
    ${lease.structuredData.houseRules?.join('\n') || 'None'}
    
    Generated at: ${new Date().toISOString()}
    `;

    const fileName = `leases/${lease.id}/lease_v${Date.now()}.txt`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, documentContent, {
        contentType: 'text/plain', // In reality, application/pdf
        upsert: false,
      });

    if (uploadError) {
      _logger.error(`Failed to upload lease document to storage`, {
        error: uploadError,
        leaseId,
      });
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    // Update the lease record with the new document URL
    await LeaseRepository.updateDocument(lease.id, publicUrl);

    _logger.info(`Lease document generated and archived`, {
      leaseId,
      url: publicUrl,
    });

    return publicUrl;
  }
}
