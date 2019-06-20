import dgram from 'dgram';

export default class API {
  static queryUT99Server(host, port) {
    return new Promise((resolve, reject) => {
      try {
        let status = '';
        const socket = dgram.createSocket('udp4');
        const datagram = '\\status\\XServerQuery';

        socket.send(datagram, port, host, err => {
          if (err) reject(err);
        });

        socket.on('message', message => {
          const unicodeValues = message.toJSON().data;
          const unicodeString = String.fromCharCode(...unicodeValues);
          status += unicodeString;

          if (unicodeString.split('\\').some(s => s === 'final')) {
            resolve(status);
            return socket.close();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}
