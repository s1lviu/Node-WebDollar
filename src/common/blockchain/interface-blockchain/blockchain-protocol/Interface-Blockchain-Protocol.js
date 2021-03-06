import NodesList from 'node/lists/nodes-list'
import InterfaceBlockchainProtocolForkSolver from './Interface-Blockchain-Protocol-Fork-Solver'

const colors = require('colors/safe');

/**
 * Blockchain Protocol
 */
class InterfaceBlockchainProtocol {

    constructor(blockchain) {

        this.blockchain = blockchain;

        this.forkSolver = new InterfaceBlockchainProtocolForkSolver(blockchain);

        NodesList.registerEvent("connected", {type: ["all"]}, (err, result) => {
            this._initializeNewSocket(err, result)
        });
        NodesList.registerEvent("disconnected", {type: ["all"]}, (err, result) => {
            this._uninitializeSocket(err, result)
        });

    }

    _initializeNewSocket(err, nodesListObject) {

        let socket = nodesListObject.socket;

        socket.on("blockchain/header/new-block", async (data) => {

            /*
                data.height
                data.chainLength
                data.prevHash
                data.hash
             */


            try {

                let answer = {result:false, message: ""};

                // validating data
                if (typeof data.height !== 'number') throw 'height is not specified';
                if (typeof data.chainLength !== 'number') throw 'chainLength is not specified';
                if ((typeof data.prevHash === 'string' || Buffer.isBuffer(data.prevHash)) === false) throw 'prevHash is not specified';
                if ((typeof data.hash === 'string' || Buffer.isBuffer(data.hash)) === false) throw 'hash is not specified';

                if (data.chainLength < data.height) throw ('chainLength is smaller than block height ?? ');

                //in case the hashes are the same, and I have already the block
                if (this.blockchain.blocks[data.height].hash.equals(data.hash))
                    throw "hash provided is lower than mine";

                let result = false;

                //hashes are different
                if (this.blockchain.getBlockchainLength() <= data.chainLength) {

                    if (this.blockchain.getBlockchainLength() === data.chainLength) {

                        // most complex hash, let's download him
                        if (data.hash.compare(this.blockchain.getBlockchainLastBlock().hash) < 0) {

                            let block = await socket.sendRequestWaitOnce("blockchain/blocks/request-block-by-height", {height: data.height}, data.height);
                            if (block !== null) {
                                await this.blockchain.includeBlockchainBlock(block);
                                return;
                            }

                        } else
                            result = await this.forkSolver.discoverAndSolveFork(socket, data.chainLength)

                    } else { // the socket has a bigger chain

                        result = await this.forkSolver.discoverAndSolveFork(socket, data.chainLength)

                    }


                }

                socket.sendRequest("blockchain/header/new-block/" + data.height||0, {result:true, forkAnswer: result  } );


            } catch (exception) {

                console.log(colors.red("Socket Error - blockchain/new-block-header", exception.toString()));

                socket.sendRequest("blockchain/header/new-block/" + data.height||0, {result:false, message: exception.toString() } );
            }


        });

        socket.on("blockchain/headers/request-block-by-height", (data) => {

            // data.height

            try {

                if (typeof data.height !== 'number') throw "data.height is not defined";

                if (this.blockchain.getBlockchainLength() < data.height) throw "data.height is higher than I have";


                let block = this.blockchain.blocks[data.height];


                socket.sendRequest("blockchain/headers/request-block-by-height/" + data.height||0, {
                    result:true,
                    block: {
                        height: block.height,
                        prevHash: block.hashPrev,
                        hash: block.hash,
                        chainLength: this.blockchain.getBlockchainLength()
                    }
                });

            } catch (exception) {

                console.log(colors.red("Socket Error - blockchain/get-block-header", exception.toString()));
                socket.sendRequest("blockchain/headers/request-block-by-height/" + data.height||0, {result:false, message: exception.toString() } );
            }
        });



        socket.on("blockchain/blocks/request-block-by-height", (data) => {

            // data.height

            try {


                if (typeof data.height !== 'number') throw "data.height is not defined";

                if (this.blockchain.getBlockchainLength() < data.height) throw "data.height is higher than I have";


                let block = this.blockchain.blocks[data.height];

                socket.sendRequest("blockchain/blocks/request-block-by-height/" + data.height||0, {
                    result: true,
                    block: block.serializeBlock()
                });

            } catch (exception) {

                console.log(colors.red("Socket Error - blockchain/blocks/request-block-by-height ", exception.toString()));
                socket.sendRequest("blockchain/blocks/request-block-by-height/" + data.height||0, {result:false, message: exception.toString() } );

            }
        });

    }

    _uninitializeSocket(err, nodesListObject) {

        let socket = nodesListObject.socket;

    }

}


export default InterfaceBlockchainProtocol;