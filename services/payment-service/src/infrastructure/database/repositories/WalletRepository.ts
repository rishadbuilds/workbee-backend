import { injectable } from "tsyringe";
import { getPrisma } from "../../config/prisma";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { Wallet } from "../../../domain/entities/Wallet";
import { UserRole } from "workbee-common";
import { Wallet as PrismaWallet, WalletRole as PrismaWalletRole,} from "../../../generated/prisma/client";

@injectable()
export class WalletRepository implements IWalletRepository {
  private get db() {
    return getPrisma();
  }

  private mapWallet(row: PrismaWallet): Wallet {
    return {
      id: row.id,
      ownerId: row.ownerId,
      role: row.role as unknown as UserRole,
      balance: Number(row.balance),
      pendingBalance: Number(row.pendingBalance),
      totalEarned: Number(row.totalEarned),
      totalSpent: Number(row.totalSpent),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findByOwner(ownerId: string, role: UserRole): Promise<Wallet | null> {
    const row = await this.db.wallet.findUnique({
      where: {
        ownerId_role: {
          ownerId,
          role: role as unknown as PrismaWalletRole,
        },
      },
    });
    return row ? this.mapWallet(row) : null;
  }

  async findOrCreate(ownerId: string, role: UserRole): Promise<Wallet> {
    const row = await this.db.wallet.upsert({
      where: {
        ownerId_role: {
          ownerId,
          role: role as unknown as PrismaWalletRole,
        },
      },
      update: {},
      create: {
        ownerId,
        role: role as unknown as PrismaWalletRole,
      },
    });
    return this.mapWallet(row);
  }

  async updateBalance(walletId: string, delta: number): Promise<Wallet> {
    const row = await this.db.wallet.update({
      where: { id: walletId },
      data: { balance: { increment: delta } },
    });
    return this.mapWallet(row);
  }

  async updatePendingBalance(walletId: string, delta: number): Promise<Wallet> {
    const row = await this.db.wallet.update({
      where: { id: walletId },
      data: { pendingBalance: { increment: delta } },
    });
    return this.mapWallet(row);
  }

  async movePendingToBalance(walletId: string, amount: number): Promise<Wallet> {
    const row = await this.db.wallet.update({
      where: { id: walletId },
      data: {
        pendingBalance: { decrement: amount },
        balance: { increment: amount },
      },
    });
    return this.mapWallet(row);
  }

  async incrementTotalEarned(walletId: string, amount: number): Promise<void> {
    await this.db.wallet.update({
      where: { id: walletId },
      data: { totalEarned: { increment: amount } },
    });
  }

  async incrementTotalSpent(walletId: string, amount: number): Promise<void> {
    await this.db.wallet.update({
      where: { id: walletId },
      data: { totalSpent: { increment: amount } },
    });
  }
}