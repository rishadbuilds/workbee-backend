import 'reflect-metadata';
import { container } from 'tsyringe';

// usecases
import { ScheduleWorkerPayoutUseCase } from '../../application/use-cases/worker/ScheduleWorkerPayoutUseCase';
import { ReleaseWorkerPayoutUseCase } from '../../application/use-cases/worker/ReleaseWorkerPayoutUseCase';
import { GetWalletUseCase } from '../../application/use-cases/wallet/GetWalletUseCase';
import { GetAdminPaymentSummaryUseCase } from '../../application/use-cases/admin/GetAdminPaymentSummaryUseCase';
import { CreateRazorpayOrderUseCase } from '../../application/use-cases/payment/CreateRazorpayOrderUseCase';
import { VerifyRazorpayPaymentUseCase } from '../../application/use-cases/payment/VerifyRazorpayPaymentUseCase';
import { GetAdminPaymentsListUseCase } from '../../application/use-cases/admin/GetAdminPaymentsListUseCase';

// interfaces
import { ICreateRazorpayOrderUseCase } from '../../application/ports/user/ICreateRazorpayOrderUseCase';
import { IVerifyRazorpayPaymentUseCase } from '../../application/ports/payment/IVerifyRazorpayPaymentUseCase';
import { IReleaseWorkerPayoutUseCase } from '../../application/ports/worker/IReleaseWorkerPayoutUseCase';
import { IGetWalletUseCase } from '../../application/ports/wallet/IGetWalletUseCase';
import { IGetAdminPaymentSummaryUseCase } from '../../application/ports/admin/IGetAdminPaymentSummaryUseCase';
import { IGetAdminPaymentsListUseCase } from '../../application/ports/admin/IGetAdminPaymentsListUseCase';
import { IGetWorkerEarningsStatsUseCase } from '../../application/ports/worker/IGetWorkerEarningsStatsUseCase';
import { GetWorkerEarningsStatsUseCase } from '../../application/use-cases/worker/GetWorkerEarningsStatsUseCase';
import { GetAdminPaymentStatsUseCase } from '../../application/use-cases/admin/GetAdminPaymentStatsUseCase';
import { IGetAdminPaymentStatsUseCase } from '../../application/ports/admin/IGetAdminPaymentStatsUseCase';
import { MarkPaymentFailedUseCase } from '../../application/use-cases/payment/MarkPaymentFailedUseCase';
import { IMarkPaymentFailedUseCase } from '../../application/ports/payment/IMarkPaymentFailedUseCase';

/** usecase di registration */
container.register<ICreateRazorpayOrderUseCase>("CreateRazorpayOrderUseCase", { useClass: CreateRazorpayOrderUseCase });
container.register<IVerifyRazorpayPaymentUseCase>("VerifyRazorpayPaymentUseCase", { useClass: VerifyRazorpayPaymentUseCase });
container.register<ScheduleWorkerPayoutUseCase>("ScheduleWorkerPayoutUseCase", { useClass: ScheduleWorkerPayoutUseCase });
container.register<IReleaseWorkerPayoutUseCase>("ReleaseWorkerPayoutUseCase", { useClass: ReleaseWorkerPayoutUseCase });
container.register<IGetWalletUseCase>("GetWalletUseCase", { useClass: GetWalletUseCase });
container.register<IGetAdminPaymentSummaryUseCase>("GetAdminPaymentSummaryUseCase", { useClass: GetAdminPaymentSummaryUseCase });
container.registerSingleton<IGetAdminPaymentsListUseCase>("GetAdminPaymentsListUseCase", GetAdminPaymentsListUseCase);
container.register<IGetWorkerEarningsStatsUseCase>("GetWorkerEarningsStatsUseCase", GetWorkerEarningsStatsUseCase);
container.register<IGetAdminPaymentStatsUseCase>("GetAdminPaymentStatsUseCase", GetAdminPaymentStatsUseCase);
container.registerSingleton<IMarkPaymentFailedUseCase>("MarkPaymentFailedUseCase", MarkPaymentFailedUseCase);

export { container };