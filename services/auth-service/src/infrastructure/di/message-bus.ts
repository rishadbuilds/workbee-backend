import { container } from "tsyringe";

/** message bus (rmq) dipendency injection */

// interface
import { IWorkerValidationClient } from "../../application/ports/message-bus/IWorkerValidationClient";
import { IWorkerChangePasswordClient } from "../../application/ports/message-bus/IWorkerChangePasswordClient";

// consumer
import { WorkerEventConsumer } from "../message-bus/WorkerEventConsumer";

// clients
import { WorkerValidationClient } from "../message-bus/WorkerLoginValidationClient";
import { WorkerChangePasswordClient } from "../message-bus/WorkerChangePasswordClient";
import { IWorkerPasswordResetClient } from "../../application/ports/message-bus/IWorkerPasswordResetClient";
import { WorkerPasswordResetClient } from "../message-bus/WorkerPasswordResetClient";



/** bind messagebus */

container.registerSingleton("WorkerEventConsumer", WorkerEventConsumer);

container.registerSingleton<IWorkerValidationClient>("WorkerValidationClient",WorkerValidationClient);
container.registerSingleton<IWorkerChangePasswordClient>("WorkerChangePasswordClient",WorkerChangePasswordClient);
container.registerSingleton<IWorkerPasswordResetClient>("WorkerPasswordResetClient",WorkerPasswordResetClient);
