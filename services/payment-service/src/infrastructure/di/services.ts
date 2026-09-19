import 'reflect-metadata';

import { container, instanceCachingFactory } from 'tsyringe';
import { razorpayConfigFactory } from '../config/razorpay';
import { IPlatformFeeCalculator } from '../../domain/services/Iplatformfeecalculator';
import { IPaymentGateway } from '../../application/ports/payment-gateways/Ipaymentgateway';
import { RazorpayPaymentGateway } from '../services/Razorpaypaymentgateway';
import { PlatformFeeCalculator } from '../services/PlatformFeeCalculator';
import { PLATFORM_FEE_RATE } from '../../shared/constants/Payment';

container.register("RazorpayConfig", { useFactory: instanceCachingFactory(razorpayConfigFactory), });

container.registerSingleton<IPaymentGateway>("PaymentGateway", RazorpayPaymentGateway);

container.registerInstance<IPlatformFeeCalculator>("PlatformFeeCalculator", new PlatformFeeCalculator(PLATFORM_FEE_RATE));


export { container };