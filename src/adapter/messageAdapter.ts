import messageDAO from "../dao/messageDAO";
import conversacionDAO from "../dao/conversacionDAO";
import { Order, Sequelize, WhereOptions } from "sequelize";
import {
  ConversationAttributes,
  ConversationInstance,
  MessageInstance,
} from "../types";

const createMessage = (message: MessageInstance) => {
  return messageDAO.create(message);
};

const getMessagesByConversacion = (
  conversacion: Partial<ConversationAttributes>,
  order: Order = ["IdConversacion", "DESC"]
) => {
  return new Promise((resolve, rejected) => {
    conversacionDAO
      .findOneByFilter({ IdConversacion: 1 })
      ?.then((conversacion) => {
        if (conversacion && conversacion.IdConversacion) {
          messageDAO
            .findAllByFilter(
              {
                IdConversacion: conversacion.IdConversacion,
              },
              order
            )
            ?.then((messages) => {
              resolve(messages);
            });
        } else {
          resolve([]);
        }
      })
      .catch((error) => {
        rejected(error);
      });
  });
};

const getAllConversacionsUnread = (IdTaller: string | number) => {
  return new Promise((resolve, reject) => {
    messageDAO
      .findDistinctAllByFilter({ read: false, typeusuario: "cliente" })
      ?.then((messages) => {
        let Ids = messages.map((a) => a.IdConversacion);

        const filter: WhereOptions<ConversationAttributes> = {
          IdTaller: IdTaller,
          IdConversacion: Ids,
        };
        conversacionDAO
          .findAllByFilter(filter)
          ?.then((conversaciones) => {
            resolve(conversaciones);
          })
          .catch((error) => {
            reject(error);
          });
      })
      .catch((error) => {
        reject(error);
      });
  });
};

/**
 *
 * @param {*} IdConversacion
 * @param {*} cb
 */
const markallMessagesRead = (
  conversacion: WhereOptions<ConversationAttributes>,
  typeusuario: string | number
) => {
  return new Promise((resolve, rejected) => {
    conversacionDAO
      .findOneByFilter(conversacion)
      ?.then((conversacion) => {
        if (conversacion && conversacion.IdConversacion) {
          messageDAO
            .update(
              {
                IdConversacion: conversacion.IdConversacion,
                read: false,
                typeusuario: typeusuario,
              },
              { read: true }
            )
            ?.then((result) => {
              resolve(result);
            })
            .catch((error) => {
              rejected(error);
            });
        }
      })
      .catch((error) => {
        rejected(error);
      });
  });
};

const countMessagesUnReadByIdConversacion = (
  IdConversacion: string | number,
  typeusuario?: string
) => {
  return messageDAO.count({
    IdConversacion: IdConversacion,
    typeusuario: typeusuario,
    read: false,
  });
};

export default {
  createMessage,
  getMessagesByConversacion,
  markallMessagesRead,
  getAllConversacionsUnread,
  countMessagesUnReadByIdConversacion,
};
