import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { RedisService, AssignmentStatus } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';
import { LocaleUtils } from '../common/utils/locale.utils';
import { TypeMappingUtil } from './utils/type-mapping.util';
import { VariationType } from '@prisma/client';

export interface BulkAssignmentData {
  assignmentId: string;
  snippetId: string;
  assignments: Array<{
    catType: string;
    slugs: string[];
  }>;
  categoryTypes: string[]; // Real category types (city, performer, league, etc.)
  snippetVariationTypes?: string[]; // User-selected variation types (SLIM, EVERGREEN, DYNAMIC)
  locale: string;
  snippetVariations?: any[]; // Optional since dov-service fetches from DB based on snippetVariationTypes
  useNativeLogic?: boolean;
  userId: string; // User ID for assignment creation (required for foreign key constraint)
  totalCategoriesCount?: number; // Total categories from preview for accurate progress tracking
}

@Injectable()
export class AssignmentQueueService {
  private readonly logger = new Logger(AssignmentQueueService.name);
  private readonly djangoBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {
    this.djangoBaseUrl = this.configService.get('BACKEND_API_URL', 'http://localhost:8000');
  }

  async previewAssignment(
    data: Omit<BulkAssignmentData, 'assignmentId' | 'snippetVariations' | 'userId'>,
  ) {
    try {
      const url = `${this.djangoBaseUrl}/internal-seats/api/assignments/preview/`;

      const response = await firstValueFrom(
        this.httpService.post(url, {
          assignments: data.assignments,
          categoryTypes: data.categoryTypes,
          locale: LocaleUtils.normalizeToDjango(data.locale),
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error('Failed to preview assignment:', error.response?.data || error.message);
      throw new Error('Failed to preview assignment');
    }
  }

  async queueAssignment(assignmentData: BulkAssignmentData): Promise<void> {
    await this.redisService.setAssignmentStatus(assignmentData.assignmentId, {
      status: 'PENDING',
      timestamp: Date.now(),
    });

    await this.redisService.publishAssignmentToQueue(assignmentData);

    this.logger.log(`Queued assignment ${assignmentData.assignmentId}`);
  }

  async processAssignment(assignmentData: BulkAssignmentData): Promise<void> {
    const { assignmentId } = assignmentData;

    try {
      this.logger.log(`Processing assignment ${assignmentId}`);

      await this.redisService.setAssignmentStatus(assignmentId, {
        status: 'PROCESSING',
        timestamp: Date.now(),
      });

      // Create assignment records in database before processing
      // This is needed for async flow to have records to update
      await this.createAssignmentRecords(assignmentData);
      this.logger.log(`Created assignment records in database for ${assignmentId}`);

      const results = await this.executeAssignmentInDjango(assignmentData);

      await this.redisService.setAssignmentStatus(assignmentId, {
        status: 'COMPLETED',
        timestamp: Date.now(),
        results,
      });

      await this.updateAssignmentStatus(assignmentData.snippetId, 'ACTIVE');

      this.logger.log(`Assignment ${assignmentId} completed successfully`);
    } catch (error) {
      this.logger.error(`Assignment ${assignmentId} failed:`, error.message);

      await this.redisService.setAssignmentStatus(assignmentId, {
        status: 'FAILED',
        timestamp: Date.now(),
        error: error.message,
      });

      await this.updateAssignmentStatus(assignmentData.snippetId, 'FAILED');
    }
  }

  async executeAssignmentInDjango(assignmentData: BulkAssignmentData) {
    const url = `${this.djangoBaseUrl}/internal-seats/api/assignments/execute/`;
    const BATCH_SIZE = 500; // Optimal batch size for Django processing
    const HTTP_TIMEOUT = 300000; // 5 minutes timeout

    // If snippetVariationTypes are provided, fetch the actual snippet variations from DB
    let snippetVariations = assignmentData.snippetVariations;

    if (assignmentData.snippetVariationTypes && assignmentData.snippetVariationTypes.length > 0) {
      try {
        // Fetch snippet variations from database based on user selection
        snippetVariations = await this.getSnippetVariationsByTypes(
          assignmentData.snippetId,
          assignmentData.snippetVariationTypes,
        );

        this.logger.log(
          `Fetched ${snippetVariations.length} snippet variations for types: ${assignmentData.snippetVariationTypes.join(', ')}`,
        );
      } catch (error) {
        this.logger.error(
          'Failed to fetch snippet variations from DB, using provided variations:',
          error.message,
        );
        // Fallback to provided variations if DB fetch fails
      }
    }

    // Expand assignments with slugs arrays into individual assignments
    const expandedAssignments = [];
    for (const assignment of assignmentData.assignments) {
      if (assignment.slugs && Array.isArray(assignment.slugs)) {
        // Expand slugs array into individual assignments
        for (const slug of assignment.slugs) {
          expandedAssignments.push({
            catType: assignment.catType,
            slug: slug,
          });
        }
      } else if ((assignment as any).slug) {
        // Already individual assignment (legacy format)
        expandedAssignments.push(assignment as any);
      }
    }

    const assignments = expandedAssignments;
    const totalAssignments = assignments.length;

    // Use real category count from preview for accurate progress tracking
    const totalCategories = assignmentData.totalCategoriesCount || totalAssignments;


    const batches = [];

    for (let i = 0; i < totalAssignments; i += BATCH_SIZE) {
      batches.push(assignments.slice(i, i + BATCH_SIZE));
    }


    let totalProcessed = 0;
    let totalCategoriesProcessed = 0;
    const allResults = [];

    // Process each batch sequentially
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchNumber = batchIndex + 1;

      try {
        const response = await firstValueFrom(
          this.httpService.post(
            url,
            {
              snippetId: assignmentData.snippetId,
              assignments: batch, // Send only current batch
              categoryTypes: assignmentData.categoryTypes,
              snippetVariationTypes: assignmentData.snippetVariationTypes,
              locale: LocaleUtils.normalizeToDjango(assignmentData.locale),
              snippetVariations,
              useNativeLogic: true,
            },
            {
              timeout: HTTP_TIMEOUT, // 5 minutes timeout per batch
            },
          ),
        );

        if (!response.data.success) {
          throw new Error(`Django assignment execution failed for batch ${batchNumber}`);
        }

        totalProcessed += batch.length;

        // Get actual categories processed from Django response
        const batchCategoriesProcessed = response.data.results?.processed || batch.length;
        totalCategoriesProcessed += batchCategoriesProcessed;

        // Safely handle results array
        const batchResults = response.data.results;
        if (Array.isArray(batchResults)) {
          allResults.push(...batchResults);
        } else if (batchResults) {
          // If results is not an array, wrap it in array
          allResults.push(batchResults);
        }

        // Update progress in Redis for frontend tracking - use real category count
        const progressPercent = Math.round((totalCategoriesProcessed / totalCategories) * 100);

        this.logger.log(`🔄 About to update batch progress: ${assignmentData.assignmentId}`);
        this.logger.log(
          `📊 Progress data: ${progressPercent}% (${totalCategoriesProcessed}/${totalCategories} categories)`,
        );
        this.logger.log(`📊 Assignments processed: ${totalProcessed}/${totalAssignments}`);

        await this.updateBatchProgress(
          assignmentData.assignmentId,
          progressPercent,
          totalCategoriesProcessed,
          totalCategories,
        );

        this.logger.log(
          `Batch ${batchNumber}/${batches.length} completed. Progress: ${progressPercent}% (${totalCategoriesProcessed}/${totalCategories} categories)`,
        );

        // Artificial delay for testing progress display (remove in production)
        if (batchIndex < batches.length - 1) {
          this.logger.log(`⏳ Waiting 10 seconds before next batch for testing...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      } catch (error) {
        this.logger.error(`Batch ${batchNumber}/${batches.length} failed:`, error.message);
        throw new Error(
          `Assignment failed at batch ${batchNumber}/${batches.length}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `All ${batches.length} batches completed successfully. Total categories processed: ${totalCategoriesProcessed}/${totalCategories}`,
    );

    return {
      success: true,
      results: allResults,
      totalProcessed: totalCategoriesProcessed, // Return categories processed, not assignments
      totalCategories,
      batchesProcessed: batches.length,
    };
  }

  /**
   * Create assignment records in database for async processing
   */
  private async createAssignmentRecords(assignmentData: BulkAssignmentData): Promise<void> {
    const assignmentsData: Array<{
      snippetId: string;
      catType: string;
      slug: string;
      status: 'PENDING';
      createdBy: string;
    }> = [];

    // Process assignments and create database records
    for (const assignment of assignmentData.assignments) {
      let slugsToProcess: string[] = [];

      if ('slugs' in assignment && Array.isArray(assignment.slugs)) {
        slugsToProcess = assignment.slugs;
      } else if ('slug' in assignment && typeof assignment.slug === 'string') {
        slugsToProcess = [assignment.slug];
      } else {
        this.logger.warn(`Invalid assignment format: ${JSON.stringify(assignment)}`);
        continue;
      }

      const catType = assignment.catType || assignmentData.categoryTypes?.[0] || 'unknown';

      for (const slug of slugsToProcess) {
        if (slug && slug.trim()) {
          assignmentsData.push({
            snippetId: assignmentData.snippetId,
            catType,
            slug: slug.trim(),
            status: 'PENDING' as const,
            createdBy: assignmentData.userId, // Use real userId for foreign key constraint
          });
        }
      }
    }

    if (assignmentsData.length === 0) {
      this.logger.warn('No valid assignments to create');
      return;
    }

    // Check for existing assignments to update them instead of creating duplicates
    const existingAssignments = await this.prisma.snippetAssignment.findMany({
      where: {
        snippetId: assignmentData.snippetId,
        OR: assignmentsData.map(item => ({
          catType: item.catType,
          slug: item.slug,
        })),
      },
    });

    // Separate existing and new assignments
    const existingKeys = new Set(existingAssignments.map(a => `${a.catType}:${a.slug}`));

    const assignmentsToUpdate = existingAssignments;
    const assignmentsToCreate = assignmentsData.filter(
      item => !existingKeys.has(`${item.catType}:${item.slug}`),
    );

    this.logger.log(
      `Async assignment: ${assignmentsToUpdate.length} existing to update, ${assignmentsToCreate.length} new to create`,
    );

    // Create and update assignments in transaction with extended timeout for large batches
    const result = await this.prisma.$transaction(
      async tx => {
        let createdCount = 0;
        let updatedCount = 0;

        // Update existing assignments
        if (assignmentsToUpdate.length > 0) {
          for (const existingAssignment of assignmentsToUpdate) {
            await tx.snippetAssignment.update({
              where: { id: existingAssignment.id },
              data: {
                status: 'PENDING',
                updatedAt: new Date(),
                createdBy: assignmentData.userId, // Update who last modified it
              },
            });
            updatedCount++;
          }
        }

        // Create new assignments
        if (assignmentsToCreate.length > 0) {
          const createdAssignments = await tx.snippetAssignment.createMany({
            data: assignmentsToCreate,
          });
          createdCount = createdAssignments.count;
        }

        // Create history entries for both updated and created assignments
        const allProcessedCatTypes = [...new Set(assignmentsData.map(item => item.catType))];
        const allAssignments = await tx.snippetAssignment.findMany({
          where: {
            snippetId: assignmentData.snippetId,
            catType: { in: allProcessedCatTypes },
          },
        });

        // Create history entries
        const historyData = [];

        // History for updated assignments
        for (const assignment of assignmentsToUpdate) {
          historyData.push({
            assignmentId: assignment.id,
            action: 'UPDATED' as const,
            userId: assignmentData.userId,
            newValues: {
              catType: assignment.catType,
              slug: assignment.slug,
              status: 'PENDING',
            },
            metadata: {
              reason: 'async_snippet_reassignment',
              timestamp: new Date().toISOString(),
            },
          });
        }

        // History for new assignments
        const newAssignments = allAssignments.filter(a =>
          assignmentsToCreate.some(
            newItem => a.catType === newItem.catType && a.slug === newItem.slug,
          ),
        );

        for (const assignment of newAssignments) {
          historyData.push({
            assignmentId: assignment.id,
            action: 'CREATED' as const,
            userId: assignmentData.userId,
            newValues: {
              catType: assignment.catType,
              slug: assignment.slug,
              status: assignment.status,
            },
            metadata: {
              reason: 'async_assignment',
              timestamp: new Date().toISOString(),
            },
          });
        }

        if (historyData.length > 0) {
          await tx.assignmentHistory.createMany({
            data: historyData,
          });
        }

        this.logger.log(
          `Async assignment transaction completed: ${updatedCount} updated, ${createdCount} created`,
        );

        return {
          count: updatedCount + createdCount,
          updated: updatedCount,
          created: createdCount,
        };
      },
      {
        timeout: 15000, // 15 seconds timeout for large batches
      },
    );

    this.logger.log(`Created ${result.count} assignment records in database`);
  }

  private async updateAssignmentStatus(
    snippetId: string,
    status: 'PENDING' | 'ACTIVE' | 'FAILED' | 'ARCHIVED',
  ) {
    // Update assignments by snippetId for async flow
    const updated = await this.prisma.snippetAssignment.updateMany({
      where: {
        snippetId: snippetId, // Use real snippetId directly
      },
      data: { status },
    });

    this.logger.log(
      `Updated ${updated.count} assignment records for snippetId ${snippetId} to status: ${status}`,
    );
  }

  private async updateBatchProgress(
    assignmentId: string,
    progressPercent: number,
    processed: number,
    total: number,
  ) {
    try {
      // Update Redis with batch progress for frontend tracking
      const progressData: AssignmentStatus = {
        status: 'PROCESSING' as const,
        timestamp: Date.now(),
        progress: {
          processed,
          total,
          failed: 0, // No failures during processing
        },
      };

      this.logger.log(`🔴 REDIS UPDATE: Setting status for ${assignmentId}`);
      this.logger.log(`📊 REDIS DATA:`, JSON.stringify(progressData, null, 2));

      await this.redisService.setAssignmentStatus(assignmentId, progressData);

      this.logger.log(
        `✅ REDIS SUCCESS: Updated batch progress for ${assignmentId}: ${progressPercent}% (${processed}/${total})`,
      );

      // Verify the data was saved by reading it back
      const savedData = await this.redisService.getAssignmentStatus(assignmentId);
      this.logger.log(`🔍 REDIS VERIFY:`, JSON.stringify(savedData, null, 2));
    } catch (error) {
      this.logger.error('❌ REDIS ERROR: Failed to update batch progress in Redis:', error.message);
      // Don't throw - progress update failure shouldn't stop assignment
    }
  }

  async getAssignmentStatus(assignmentId: string): Promise<AssignmentStatus | null> {
    const status = await this.redisService.getAssignmentStatus(assignmentId);
    this.logger.log(`🔍 GET STATUS: ${assignmentId}`);
    this.logger.log(`📊 STATUS DATA:`, JSON.stringify(status, null, 2));
    return status;
  }

  /**
   * Fetch snippet variations from database based on variation types
   */
  private async getSnippetVariationsByTypes(
    snippetId: string,
    variationTypes: string[],
  ): Promise<any[]> {
    this.logger.log(
      `🔍 Fetching snippet variations for ID: ${snippetId}, types: ${variationTypes.join(', ')}`,
    );

    // Log available VariationType enum values
    this.logger.log(
      `📋 Available VariationType values: ${Object.values(VariationType).join(', ')}`,
    );

    // Convert string types to VariationType enum (normalize to uppercase)
    // Handle legacy 'DEFAULT' type by mapping to all available types
    const normalizedTypes = variationTypes.flatMap(type => {
      const upperType = type.toUpperCase();
      if (upperType === 'DEFAULT') {
        // Map DEFAULT to all available variation types
        return Object.values(VariationType);
      }
      return [upperType];
    });
    this.logger.log(`🔄 Normalized types: ${normalizedTypes.join(', ')}`);

    const validTypes = [...new Set(normalizedTypes)]
      .filter(type => Object.values(VariationType).includes(type as VariationType))
      .map(type => type as VariationType);

    this.logger.log(`✅ Valid types after filtering: ${validTypes.join(', ')}`);

    if (validTypes.length === 0) {
      this.logger.warn(`❌ No valid variation types found in: ${variationTypes.join(', ')}`);
      this.logger.warn(`💡 Expected one of: ${Object.values(VariationType).join(', ')}`);
      return [];
    }

    // Fetch snippet with sub-snippets of specified types
    this.logger.log(`🔍 Searching for snippet with ID: ${snippetId}`);

    const snippet = await this.prisma.snippet.findUnique({
      where: { id: snippetId },
      include: {
        subSnippets: {
          where: {
            type: { in: validTypes },
          },
          include: {
            paragraphs: {
              include: {
                variations: {
                  orderBy: { order: 'asc' },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!snippet) {
      this.logger.error(`❌ Snippet with ID ${snippetId} not found in database`);
      throw new Error(`Snippet with ID ${snippetId} not found`);
    }

    this.logger.log(
      `✅ Found snippet: ${snippet.title}, component=${snippet.component}, subSnippets count: ${snippet.subSnippets.length}`,
    );

    // Log sub-snippets details
    snippet.subSnippets.forEach((subSnippet, index) => {
      this.logger.log(
        `📄 SubSnippet ${index + 1}: type=${subSnippet.type}, paragraphs=${subSnippet.paragraphs.length}`,
      );
    });

    // Use component as business type, but map to Django backend format
    const frontendType = snippet.component; // component IS the snippet type (CTA/FAQ/DESCRIPTION)
    const businessType = TypeMappingUtil.mapTypeToBackend(frontendType); // Map DESCRIPTION → DEFAULT for Django
    this.logger.log(
      `🏷️ Mapping type: ${frontendType} (frontend) → ${businessType} (Django backend)`,
    );

    // Transform database structure to format expected by Django
    const snippetVariations = [];

    for (const subSnippet of snippet.subSnippets) {
      // Create structured variations for Django Jinja formation
      const structuredVariations = [];

      // Process base content
      if (subSnippet.base && subSnippet.base.trim()) {
        const baseParams = this.extractParametersFromContent(subSnippet.base);
        structuredVariations.push({
          body: subSnippet.base.trim(),
          params: baseParams,
        });
      }

      // Process each paragraph and its variations
      for (const paragraph of subSnippet.paragraphs) {
        // Add paragraph content
        if (paragraph.content && paragraph.content.trim()) {
          const paragraphParams = this.extractParametersFromContent(paragraph.content);
          structuredVariations.push({
            body: paragraph.content.trim(),
            params: paragraphParams,
          });
        }

        // Add all variations (Django will handle randomization with random.choice)
        for (const variation of paragraph.variations) {
          if (variation.content && variation.content.trim()) {
            const variationParams = this.extractParametersFromContent(variation.content);
            structuredVariations.push({
              body: variation.content.trim(),
              params: variationParams,
            });
          }
        }
      }

      const snippetVariation = {
        title: snippet.title, // Real snippet title
        variations: structuredVariations, // Structured data for Django Jinja formation
        type: businessType, // Business type for Django (CTA/FAQ/DESCRIPTION) determined from component
        snippet_id: snippetId, // Main snippet ID for identification in Django
        variation_type: subSnippet.type, // Frontend variation type (SLIM/EVERGREEN/DYNAMIC)
      };

      this.logger.log(
        `📝 Created snippet variation: business_type=${snippetVariation.type}, snippet_id=${snippetVariation.snippet_id}, variation_type=${snippetVariation.variation_type}, variations_count=${structuredVariations.length}`,
      );
      snippetVariations.push(snippetVariation);
    }

    return snippetVariations;
  }

  /**
   * Extract Django template parameters from content
   * Finds all {{ variable }} patterns and returns them as params array
   */
  private extractParametersFromContent(content: string): string[] {
    if (!content) return [];

    // Regular expression to match Django template variables: {{ variable.name }}
    const paramRegex = /\{\{\s*([^}]+)\s*\}\}/g;
    const params: string[] = [];
    let match;

    while ((match = paramRegex.exec(content)) !== null) {
      const param = match[1].trim();
      // Avoid duplicates
      if (!params.includes(param)) {
        params.push(param);
      }
    }

    this.logger.log(`🔍 Extracted ${params.length} parameters from content: ${params.join(', ')}`);
    return params;
  }
}
