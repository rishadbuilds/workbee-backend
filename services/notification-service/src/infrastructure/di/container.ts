import "reflect-metadata";
import { container } from "tsyringe";

import "./repositories"
import "./services"
import "./use-cases"
import "./message-bus"

// export di files
export {container};