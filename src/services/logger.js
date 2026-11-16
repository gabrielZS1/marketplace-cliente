/**
 * Logger que só escreve no console em desenvolvimento.
 *
 * Em build de produção (`__DEV__ === false`) log/warn viram no-op, para não vazar tokens de
 * sessão, payloads de agendamento ou dados pessoais do cliente nos logs do dispositivo.
 * Erros vão para o relatório de falhas (Sentry, se configurado) — chame sempre com
 * mensagens já higienizadas.
 */
import { reportError } from "./monitoring";

const noop = () => {};

function errorInProduction(message, err) {
  if (err instanceof Error) {
    reportError(err, typeof message === "string" ? { message } : undefined);
  } else if (message instanceof Error) {
    reportError(message);
  } else if (typeof err === "string" && err) {
    // Ex.: logger.error("Erro ao carregar X:", error?.message) — junta o motivo, curto.
    reportError(`${String(message)} ${err.slice(0, 200)}`);
  } else {
    reportError(String(message));
  }
}

export const logger = __DEV__
  ? {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    }
  : {
      log: noop,
      warn: noop,
      error: errorInProduction,
    };

export default logger;
