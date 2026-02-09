import { Injectable, NotFoundException } from '@nestjs/common';
import { ContactRepository } from './contact.repository';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactQueryDto } from './dto/contact-query.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';
import { Contact, ContactStatus } from '../../entities/contact.entity';
import { PaginatedResponse, ApiResponse } from '../../common/interfaces/response.interface';

@Injectable()
export class ContactService {
  constructor(private readonly contactRepository: ContactRepository) {}

  async findAll(query: ContactQueryDto): Promise<ApiResponse<PaginatedResponse<Contact>>> {
    const result = await this.contactRepository.findAll(query);
    return {
      status: 'success',
      message: 'Contact submissions retrieved successfully',
      data: result,
      meta: result.meta,
    };
  }

  async findById(id: string): Promise<ApiResponse<Contact>> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundException(`Contact submission with ID "${id}" not found`);
    }

    // Mark as read if new
    if (contact.status === ContactStatus.NEW) {
      await this.contactRepository.update(id, {
        status: ContactStatus.READ,
        readAt: new Date(),
      });
      contact.status = ContactStatus.READ;
      contact.readAt = new Date();
    }

    return {
      status: 'success',
      message: 'Contact submission retrieved successfully',
      data: contact,
    };
  }

  async create(
    createContactDto: CreateContactDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ApiResponse<Contact>> {
    const contact = await this.contactRepository.create({
      ...createContactDto,
      ipAddress,
      userAgent,
      status: ContactStatus.NEW,
    });

    return {
      status: 'success',
      message: 'Contact form submitted successfully',
      data: contact,
    };
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateContactStatusDto,
  ): Promise<ApiResponse<Contact>> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundException(`Contact submission with ID "${id}" not found`);
    }

    const updateData: Partial<Contact> = {
      status: updateStatusDto.status,
    };

    if (updateStatusDto.notes) {
      updateData.notes = updateStatusDto.notes;
    }

    // Set timestamps based on status
    if (updateStatusDto.status === ContactStatus.READ && !contact.readAt) {
      updateData.readAt = new Date();
    }

    if (updateStatusDto.status === ContactStatus.REPLIED) {
      updateData.repliedAt = new Date();
    }

    const updatedContact = await this.contactRepository.update(id, updateData);

    return {
      status: 'success',
      message: 'Contact status updated successfully',
      data: updatedContact!,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundException(`Contact submission with ID "${id}" not found`);
    }

    await this.contactRepository.softDelete(id);

    return {
      status: 'success',
      message: 'Contact submission deleted successfully',
      data: null,
    };
  }

  async getStats(): Promise<ApiResponse<{ new: number; read: number; replied: number; total: number }>> {
    const [newCount, readCount, repliedCount, total] = await Promise.all([
      this.contactRepository.countByStatus(ContactStatus.NEW),
      this.contactRepository.countByStatus(ContactStatus.READ),
      this.contactRepository.countByStatus(ContactStatus.REPLIED),
      this.contactRepository.countByStatus(),
    ]);

    return {
      status: 'success',
      message: 'Contact stats retrieved successfully',
      data: {
        new: newCount,
        read: readCount,
        replied: repliedCount,
        total,
      },
    };
  }
}
