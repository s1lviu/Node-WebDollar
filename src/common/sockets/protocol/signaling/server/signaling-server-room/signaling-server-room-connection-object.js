let ConnectionStatus = {

    initiatorSignalGenerating: 0,
    initiatorSignalGenerated : 1,

    answerSignalGenerating: 2,
    answerSignalGenerated: 3,

    peerConnectionEstablishing: 4,
    peerConnectionEstablished : 5,
    peerConnectionNotEstablished : 6,
};


class SignalingServerRoomConnectionObject {

    /*
        webPeer1 - initiator
        webPeer2 -
     */
    constructor(client1, client2, status, id ){

        this.client1 = client1;
        this.client2 = client2;
        this.status = status;
        this.id = id;

        this.established = false;
        this.connectingNow = false;

        this.lastTimeChecked = 0;
        this.lastTimeConnected = 0;
    }

    refreshLastTimeChecked(){
        this.lastTimeChecked = new Date().getTime();
    }

    refreshLastTimeConnected(){
        this.lastTimeConnected = new Date().getTime();
    }

}

exports.SignalingServerRoomConnectionObject = SignalingServerRoomConnectionObject;
exports.SignalingServerRoomConnectionObject.ConnectionStatus = ConnectionStatus;