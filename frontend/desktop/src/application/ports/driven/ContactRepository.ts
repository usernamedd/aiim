// Driven Port: Contact Repository
// Implemented by adapters for contact persistence

import type { Contact } from '../../../domain/entities/Contact';

export interface ContactRepository {
  findAll(): Promise<Contact[]>;
  findById(id: string): Promise<Contact | null>;
  search(query: string): Promise<Contact[]>;
  save(contact: Contact): Promise<Contact>;
  remove(contactId: string): Promise<void>;
  block(contactId: string): Promise<void>;
  unblock(contactId: string): Promise<void>;
}
