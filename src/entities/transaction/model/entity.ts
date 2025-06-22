import { Transaction, CreateTransactionData, UpdateTransactionData } from './types';
import { getToday } from '../../../shared/utils/date';
import { validateTransactionAmount, validateTransactionDescription } from '../../../shared/utils/validation';
import { getCategoryByKey } from '../../../shared/constants/categories';

export class TransactionEntity {
  constructor(private props: Transaction) {}

  static create(data: CreateTransactionData): TransactionEntity {
    // Validate required fields
    const amountValidation = validateTransactionAmount(data.amount);
    if (!amountValidation.isValid) {
      throw new Error(amountValidation.errors[0]);
    }

    const descriptionValidation = validateTransactionDescription(data.description);
    if (!descriptionValidation.isValid) {
      throw new Error(descriptionValidation.errors[0]);
    }

    // Validate category exists
    const category = getCategoryByKey(data.category);
    if (!category) {
      throw new Error(`Invalid category: ${data.category}`);
    }

    const now = new Date().toISOString();
    const transaction: Transaction = {
      id: this.generateId(),
      amount: data.amount,
      description: data.description.trim(),
      category: data.category,
      date: data.date || getToday(),
      type: data.type,
      attachments: data.attachments || [],
      tags: data.tags || [],
      location: data.location,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    return new TransactionEntity(transaction);
  }

  static fromJSON(json: Transaction): TransactionEntity {
    return new TransactionEntity(json);
  }

  // Getters
  get id(): string { return this.props.id; }
  get amount(): number { return this.props.amount; }
  get description(): string { return this.props.description; }
  get category(): string { return this.props.category; }
  get date(): string { return this.props.date; }
  get type(): TransactionType { return this.props.type; }
  get attachments(): string[] { return this.props.attachments || []; }
  get tags(): string[] { return this.props.tags || []; }
  get location(): string | undefined { return this.props.location; }
  get notes(): string | undefined { return this.props.notes; }
  get createdAt(): string { return this.props.createdAt; }
  get updatedAt(): string { return this.props.updatedAt; }

  // Computed properties
  get isExpense(): boolean { return this.props.type === 'expense'; }
  get isIncome(): boolean { return this.props.type === 'income'; }
  get hasAttachments(): boolean { return this.attachments.length > 0; }
  get hasTags(): boolean { return this.tags.length > 0; }
  get hasLocation(): boolean { return !!this.location; }
  get hasNotes(): boolean { return !!this.notes; }

  // Business methods
  update(data: Partial<UpdateTransactionData>): TransactionEntity {
    const updates: Partial<Transaction> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Validate if amount is being updated
    if (data.amount !== undefined) {
      const validation = validateTransactionAmount(data.amount);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }
    }

    // Validate if description is being updated
    if (data.description !== undefined) {
      const validation = validateTransactionDescription(data.description);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }
      updates.description = data.description.trim();
    }

    // Validate if category is being updated
    if (data.category !== undefined) {
      const category = getCategoryByKey(data.category);
      if (!category) {
        throw new Error(`Invalid category: ${data.category}`);
      }
    }

    return new TransactionEntity({
      ...this.props,
      ...updates,
    });
  }

  categorize(newCategory: string): TransactionEntity {
    return this.update({ category: newCategory });
  }

  updateAmount(newAmount: number): TransactionEntity {
    return this.update({ amount: newAmount });
  }

  addTag(tag: string): TransactionEntity {
    if (this.tags.includes(tag)) return this;
    
    return new TransactionEntity({
      ...this.props,
      tags: [...this.tags, tag],
      updatedAt: new Date().toISOString(),
    });
  }

  removeTag(tag: string): TransactionEntity {
    return new TransactionEntity({
      ...this.props,
      tags: this.tags.filter(t => t !== tag),
      updatedAt: new Date().toISOString(),
    });
  }

  addAttachment(attachmentId: string): TransactionEntity {
    if (this.attachments.includes(attachmentId)) return this;
    
    return new TransactionEntity({
      ...this.props,
      attachments: [...this.attachments, attachmentId],
      updatedAt: new Date().toISOString(),
    });
  }

  removeAttachment(attachmentId: string): TransactionEntity {
    return new TransactionEntity({
      ...this.props,
      attachments: this.attachments.filter(a => a !== attachmentId),
      updatedAt: new Date().toISOString(),
    });
  }

  setLocation(location: string): TransactionEntity {
    return new TransactionEntity({
      ...this.props,
      location,
      updatedAt: new Date().toISOString(),
    });
  }

  setNotes(notes: string): TransactionEntity {
    return new TransactionEntity({
      ...this.props,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  // Utility methods
  toJSON(): Transaction {
    return { ...this.props };
  }

  clone(): TransactionEntity {
    return new TransactionEntity({ ...this.props });
  }

  equals(other: TransactionEntity): boolean {
    return this.id === other.id;
  }

  private static generateId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}