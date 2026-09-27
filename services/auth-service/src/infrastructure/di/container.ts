import "reflect-metadata";
import { container } from "tsyringe";

/** * dependency Injection Configuration */

import "./repositories"
import "./services"
import "./usecases"
import "./message-bus"

export {container};

