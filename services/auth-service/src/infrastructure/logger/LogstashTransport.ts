import net from "node:net";
import Transport from "winston-transport";
import type { TransformableInfo } from "logform";

interface LogstashTransportOptions extends Transport.TransportStreamOptions {
  host: string;
  port: number;
}

/**
 * custom Winston transport for sending logs to Logstash
 */

export class LogstashTransport extends Transport {
  private readonly host: string;
  private readonly port: number;

  constructor(options: LogstashTransportOptions) {
    super(options);

    this.host = options.host;
    this.port = options.port;
  }

  override log(info: TransformableInfo, callback: () => void): void {
    setImmediate(() => {
      this.emit("logged", info);
    });

    const socket = new net.Socket();

    socket.connect(this.port, this.host, () => {
      const log = JSON.stringify(info) + "\n";

      socket.write(log, () => {
        socket.end();
      });
    });
    
    socket.on("error", (error) => {
      socket.destroy();
      console.error("Logstash connection error:", error.message);
    });

    callback();
  }
}