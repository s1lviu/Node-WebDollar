import NodeProtocol from 'common/sockets/protocol/node-protocol';
import NodePropagationProtocol from 'common/sockets/protocol/node-propagation-protocol'
import NodeSignalingServerProtocol from 'common/sockets/protocol/signaling/server/node-signaling-server-protocol';
import NodeSignalingClientProtocol from 'common/sockets/protocol/signaling/client/node-signaling-client-protocol';
import NodesList from 'node/lists/nodes-list'
import SocketAddress from 'common/sockets/socket-address'

// Extending Socket / Simple Peer

class SocketExtend{

    extendSocket(socket, address, port, uuid){

        socket.node = {};

        socket.node.getSocket = () => { return socket};

        socket.node.on = (name, callback ) => { socket.on(name, callback) } ;
        socket.node.sckAddress = SocketAddress.createSocketAddress(address, port);

        socket.node.sendRequest = (request, requestData) => { return this.sendRequest(socket, request, requestData) };
        socket.node.sendRequestWaitOnce = (request, requestData, answerPrefix) => {return this.sendRequestWaitOnce(socket, request, requestData, answerPrefix) };
        socket.node.broadcastRequest = (request, data, type) => { return NodeProtocol.broadcastRequest(request, data, type, socket) };

        socket.node.protocol = {};
        socket.node.protocol.helloValidated = false;
        socket.node.protocol.sendHello = (validationDoubleConnectionsTypes) => { return NodeProtocol.sendHello(socket.node, validationDoubleConnectionsTypes)  };

        socket.node.protocol.propagation = {};
        socket.node.protocol.propagation.initializePropagation = () => { return NodePropagationProtocol.initializeSocketForPropagation(socket.node) };

        socket.node.protocol.signaling = {};
        socket.node.protocol.signaling.server = {};
        socket.node.protocol.signaling.server.initializeSignalingServerService = () => { return NodeSignalingServerProtocol.initializeSignalingServerService(socket) };

        socket.node.protocol.signaling.client = {};
        socket.node.protocol.signaling.client.initializeSignalingClientService = (params) => { return NodeSignalingClientProtocol.initializeSignalingClientService(socket, params) };
    }

    sendRequest (socket, request, requestData) {

        //console.log("sendRequest ############### ", socket, request, requestData);

        if (typeof socket.emit === 'function')  return socket.emit( request, requestData ); //socket io and Simple-Peer WebRTC
        else
        if (typeof socket.send === 'function'){

            if (typeof socket.signal === 'function')
                return socket.send({request: request, data: requestData});
            else
                return socket.send( request, requestData ); // Simple Peer WebRTC - socket

        }

        console.log("ERROR!! Couldn't sendRequest ", socket, request, requestData);

    }


    /*
        Sending the Request and return the Promise to Wait Async
    */

    sendRequestWaitOnce (socket, request, requestData, answerPrefix) {

        if ( answerPrefix !== undefined) answerPrefix = String(answerPrefix); //in case it is a number

        return new Promise((resolve) => {

            let requestAnswer = request;
            if ( typeof answerPrefix === 'string' && answerPrefix.length > 0 ) {
                requestAnswer += (answerPrefix[1] !== '/' ? '/' : '') + answerPrefix;
                console.log("sendRequestWaitOnce", request)
            }

            socket.once(requestAnswer, function (resData) {
                resolve(resData);
            });

            this.sendRequest(socket, request, requestData);

        });
    }




}


export default new SocketExtend();



