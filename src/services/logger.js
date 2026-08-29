/**
 * Logger que só escreve no console em desenvolvimento.
 *
 * Em build de produção (`__DEV__ === false`) todas as chamadas viram no-op, para
 * não vazar tokens de sessão, payloads de agendamento ou dados pessoais do
 * cliente nos logs do dispositivo.
 */

const noop = () => {};

export const logger = __DEV__
  ? {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    }
  : {
      log: noop,
      warn: noop,
      // erros continuam sendo úteis, mas sem despejar objetos sensíveis:
      // chame sempre com mensagens já higienizadas.
      error: console.error.bind(console),
    };

export default logger;
