import io from 'socket.io-client';
import { useCallback } from 'react';

interface Sokets {
  [key: string]: SocketIOClient.Socket
}

const backUrl = 'http://localhost:3095';
const sockets: Sokets = {};

const useSocket = (workspace?: string) => {
  // 다른 곳에 connect 할때 disconnect 되어야함
  // workspace 이동 시 disconnect가 안되면 이후 workspace에서 이전 workspace의 데이터를 같이 받게된다.
  // const disconnect = sockets[workspace].disconnect;
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }, []);

  if (!workspace) {
    return [undefined, disconnect];
  }

  // const socket = io.connect(`${backUrl}`); // 이렇게 연결하면 서버에 있는 모든 사람에게 메시지가 전송됨
  sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`); 
  
  sockets[workspace].emit('hello', 'world'); 
  sockets[workspace].on('message', (data) => {
    console.log(data);
  });
    sockets[workspace].on('data', (data) => {
    console.log(data);
  });
    sockets[workspace].on('onlineList', (data) => {
    console.log(data);
  });

  return [sockets[workspace], disconnect];
};

export default useSocket;

// socket.io Example
// 
// socket.emit: 클라이언트에서 서버로 보내는 이벤트 (클라이언트에서는 emit으로 보냄) => 보내기
// socket.emit('hello', 'world');
//
// socket.on: 서버에서 클라이언트로 보내는 이벤트 (클라이언트에서는 on으로 받음) => 받기
// socket.on('message', (data) => {
//   console.log(data);
// });
// 
// socket.disconect: 맺은 연결을 끊음
// socket.disconect();