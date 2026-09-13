import { Transaction } from "../../domain/entities/Transaction";
import { TransactionDTO } from "../dtos/wallet/TransactionDTO";

export class TransactionMapper {
  static toDTO(tx: Transaction): TransactionDTO {
    return {
      id: tx.id,
      workId: tx.workId,
      type: tx.type,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status,
      description: tx.description,
      createdAt: tx.createdAt,
    };
  }

  static toDTOList(transactions: Transaction[]): TransactionDTO[] {
    return transactions.map(this.toDTO);
  }

  /**
   * Types a given role should never see. Used to build the DB query
   * (WHERE type NOT IN (...)) so pagination totals stay accurate —
   */
  
  static getExcludedTypesForRole(role: string): string[] {
    switch (role) {
      case "worker":
        return ["platform_fee"];
      default:
        return [];
    }
  }
}