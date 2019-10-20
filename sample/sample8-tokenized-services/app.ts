import "reflect-metadata";
import { Container } from "../../src/index";
import { ReaderService, StoreService } from "./Tokens";
import { FtpStore } from "./FtpStore";
import { FtpReader } from "./FtpReader";

Container.set(StoreService, new FtpStore());
Container.set(ReaderService, new FtpReader());

const store = Container.get(StoreService);
console.log(store.save());

const reader = Container.get(ReaderService);
console.log(reader.read());
