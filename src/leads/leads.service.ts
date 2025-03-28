import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterLeadsByListingDto } from './dto/filter.dto';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  // Create a new lead
  async create(createLeadDto: CreateLeadDto, userId: string) {
    const {
      budgetMax,
      budgetMin,
      name,
      phoneNumber,
      preferredLocations,
      propertyTypes,
      email,
      note,
    } = createLeadDto;

    try {
      return await this.prisma.lead.create({
        data: {
          budgetMax,
          budgetMin,
          name,
          phoneNumber,
          preferredLocations,
          propertyTypes,
          email: email || null,
          brokerId: userId, // Link lead to the broker
          note,
        },
      });
    } catch (error) {
      console.error('Error creating lead:', error);

      // Handle Prisma unique constraint violation
      if (error.code === 'P2002') {
        throw new BadRequestException(
          `A lead with this phone number (${phoneNumber}) already exists.`,
        );
      }

      // Rethrow any unexpected errors
      throw new Error('An unexpected error occurred while creating the lead.');
    }
  }

  // Find all leads with optional search
  async findAll(userId: string, searchParams?: { query?: string }) {
    const { query } = searchParams || {};

    try {
      const filters: any = {
        brokerId: userId,
      };

      if (query) {
        filters.OR = [
          {
            name: { contains: query, mode: 'insensitive' },
          },
          {
            phoneNumber: { contains: query, mode: 'insensitive' },
          },
          {
            email: { contains: query, mode: 'insensitive' },
          },
        ];
      }
      return await this.prisma.lead
        .findMany({
          where: filters,
          include: {
            listing: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
        .then((leads) =>
          leads.map((lead) => ({
            ...lead,
            propertyName: lead.listing?.title || 'N/A',
            listing: undefined,
          })),
        );
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw new Error('An unexpected error occurred while fetching leads.');
    }
  }

  // Find one lead by ID
  async findOne(id: string) {
    try {
      const lead = await this.prisma.lead.findUnique({
        where: { id },
      });

      if (!lead) {
        throw new NotFoundException(`Lead with ID ${id} not found.`);
      }

      return lead;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw new Error('An unexpected error occurred while fetching the lead.');
    }
  }

  // Update a lead
  async update(id: string, updateLeadDto: UpdateLeadDto) {
    try {
      const existingLead = await this.prisma.lead.findUnique({
        where: { id },
      });

      if (!existingLead) {
        throw new NotFoundException(`Lead with ID ${id} not found.`);
      }

      return await this.prisma.lead.update({
        where: { id },
        data: updateLeadDto,
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      throw new Error('An unexpected error occurred while updating the lead.');
    }
  }

  // Delete a lead
  async remove(id: string, brokerId: string) {
    try {
      const existingLead = await this.prisma.lead.findUnique({
        where: { id, brokerId },
      });

      if (!existingLead) {
        throw new NotFoundException(`Lead with ID ${id} not found.`);
      }

      await this.prisma.lead.delete({
        where: { id },
      });

      return { message: `Lead with ID ${id} successfully deleted.` };
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw new NotFoundException(`Lead with ${id} not found`);
    }
  }

  async filterByListing(userId: string, filterDto: FilterLeadsByListingDto) {
    const { listingId, status, priority, isActive } = filterDto;

    // Build the where condition using Prisma's filtering capabilities
    const where = {
      // Ensure user can only see their own leads
      brokerId: userId,

      // Required filter by listing ID
      listingId,

      // Optional filters
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(isActive !== undefined && { isActive }),
    };

    // Return filtered leads with listing information included
    const leads = await this.prisma.lead.findMany({
      where,
      include: {
        // Include the related listing data
        listing: true,
      },
      // Add sorting by creation date (newest first)
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate total count for pagination purposes
    const total = await this.prisma.lead.count({ where });

    return {
      data: leads,
      meta: {
        total,
        filtered: leads.length,
      },
    };
  }
}
