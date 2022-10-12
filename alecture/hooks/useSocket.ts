// websocket을 편리하게 쓰기 위해 만들어진 라이브러리 - socket.io
import io from 'socket.io-client';
import { useCallback } from 'react';

interface Sokets {
  [key: string]: SocketIOClient.Socket
}

const backUrl = 'http://localhost:3095';
const sockets: Sokets = {};

const useSocket = (workspace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  // 다른 곳에 connect 할때 disconnect 되어야함
  // workspace 이동 시 disconnect가 안되면 이후 workspace에서 이전 workspace의 데이터를 같이 받게된다.
  // const disconnect = sockets[workspace].disconnect;
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }, [workspace]);

  if (!workspace) {
    return [undefined, disconnect];
  }

  if (!sockets[workspace]) {
    // const socket = io.connect(`${backUrl}`); // 이렇게 연결하면 서버에 있는 모든 사람에게 메시지가 전송됨
    sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
      // websocket polling 에러가 나는 경우? (요청을 http로 보내는데?)
      // 웹소켓 지원을 안하는 브라우저(ie9)가 있기 때문에 처음에는 http로 요청을 보냈다가
      // 웹소켓을 지원하는게 확인되면 그때서야 웹소켓을 사용하게 되는데, 이러한 경우를 transports 옵션으로 제어할 수 있음.
      transports: ['websocket']
      
      // 크롬 개발자도구 Network 탭보면 Headers, Messages, Initiator, Timing 이라는 항목으로 좀 달라진다.
    }); 
  }
  
  // sockets[workspace].emit('hello', 'world'); 
  // sockets[workspace].on('message', (data) => {
  //   console.log(data);
  // });
  //   sockets[workspace].on('data', (data) => {
  //   console.log(data);
  // });
  //   sockets[workspace].on('onlineList', (data) => {
  //   console.log(data);
  // });

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

// socket
// socket.sendBuffer에 데이터가 있을 경우:
// - socket은 연결이 끊어지면 임시로 sendBuffer에 데이터를 저장해뒀다가 다시 연결하면 모아뒀던 것을 보낸다. 
// - 반대로 서버에서 끊겼을때 임시로 담아두는 것은 receiveBuffer
// socket._callbacks:
// - on 했던 리스트들이 들어있다. connect, connecting은 default 
// socket.io:
// - 연결에 대한 옵션들