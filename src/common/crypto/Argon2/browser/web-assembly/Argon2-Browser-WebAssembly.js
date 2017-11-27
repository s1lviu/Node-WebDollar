import consts from 'consts/const_global'

let Argon2WebAssemblyCalc = require('./antelle/calc.js')
let Argon2WebAssemblyMain = require('./antelle/main.js')
//require('antelle/worker.js')

/*
    TUTORIAL BASED ON https://github.com/antelle/argon2-browser/blob/master/docs/index.html
 */

const HASH_ARGON2_OPTIONS = { salt: consts.HASH_ARGON2_PARAMS.salt, time: consts.HASH_ARGON2_PARAMS.time, mem: consts.HASH_ARGON2_PARAMS.memBytes, parallelism: consts.HASH_ARGON2_PARAMS.parallelism, type: consts.HASH_ARGON2_PARAMS.type, hashLen: consts.HASH_ARGON2_PARAMS.hashLen, distPath: consts.HASH_ARGON2_PARAMS.distPath}

class Argon2BrowserWebAssembly{

    constructor(){

    }

    /*
        Simple Hash
     */

    _calculateHash(method, params){

        try {
            return Argon2WebAssemblyCalc.calc(method, params)
        } catch (Exception){
            console.log('_calculateHashWorker raised exception', Exception.toString())
            return null;
        }
    }

    calcBest(params){
        let result ;

        result = this._calculateHash(Argon2WebAssemblyCalc.calcAsmJs,params);
        if (result !== null) return result;

        result = this._calculateHash(Argon2WebAssemblyCalc.calcWasm,params);
        if (result !== null) return result;

        result = this._calculateHash(Argon2WebAssemblyCalc.calcBinaryenSexpr, params);
        if (result !== null) return result;

        result = this._calculateHash(Argon2WebAssemblyCalc.calcBinaryenBin, params);
        if (result !== null) return result;

        result = this._calculateHash(Argon2WebAssemblyMain.calcPNaCl, params);
        return result;
    }

    /*
        Workers
     */
    _calculateHashWorker(method, params){


        try {
            return Argon2WebAssemblyCalc.calcWorker(method, params)
        } catch (Exception){
            console.log('_calculateHashWorker raised exception', Exception.toString())
            return null;
        }
    }

    calcWorkerAsm(data){
        this._calculateHashWorker('asm', data)
    }

    calcWorkerWasm(data){
        this._calculateHashWorker('wasm', data)
    }

    calcWorkerBest(data) {
        let result;

        result = this.calcWorkerAsm(data)
        if (result !== null) return result;

        result = this.calcWorkerWasm(data)
        if (result !== null) return result;
    }

    async hash(data){

        try{

            let params = HASH_ARGON2_OPTIONS;
            params.pass = data

            let result = await this.calcBest(params);

            if (result !== null) throw("Argon2 returned empty");

            console.log("ARgon2Browser", result.hash);
            return new Buffer(result.hash);

        } catch (Exception){
            console.log("Argon2 exception", Exception)

            throw Exception
        }

    }

    async hashString(data){

        try{

            let params = HASH_ARGON2_OPTIONS;
            params.pass = data

            let result = await this.calcBest( params );

            if (result !== null) throw("Argon2 returned empty");

            let hash = result.encoded.substr(-HASH_ARGON2_OPTIONS.hashLength)

            //console.log("ARgon2Browser", result.encoded, hash);

            return hash

        } catch (Exception){
            console.log("Argon2 exception", Exception)

            throw Exception
        }

    }


}

export default new Argon2BrowserWebAssembly()