let io;

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: true,
        credentials: true
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  emitBalanceUpdate: (userId, balance) => {
    if (io) {
      io.emit(`balance_${userId}`, { balance });
    }
  }
};
