class BlockchainGenesis{

    constructor(){

        this.hashPrev = new Buffer("7bb3e84e6892c7e76be2beedb94a1035b7f095d50b5462806b92be0cbccd31fa", "hex")

        this.timeStamp = 0x5A2FC60F;

        this.difficultyTarget = new Buffer ( "05978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb", "hex" ); //hard difficulty
        //this.difficultyTarget = new Buffer ( [0xff, 0xff, 0xff] ); // easy difficulty

        this.address = "1F1tAaz5x1HUXrCNLbtMDqcw6o5GNn4xqX"; // genesis address
    }

    validateGenesis(block){

        if ( block.timeStamp.length !== this.timeStamp.length ) throw "Timestamp doesn't match";
        if ( block.timeStamp > 0x000FFFFF) throw "Timestamp is too old "+block.timeStamp.toString();
    }



}

export default new BlockchainGenesis();