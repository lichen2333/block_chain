
var express             = require('express');
var app                 = express();
var bodyParse           = require('body-parser')

app.use(bodyParse.json())
app.use(bodyParse.urlencoded({extended:false})) ;

const path = require('path');
const utils = require('./api/common/utils');
const fs = require('fs');
const { Web3jService, ConsensusService, SystemConfigService } = require('./api');
const { ContractsDir, ContractsOutputDir } = require('./cli/constant');

const web3 = new Web3jService();
const consensusService = new ConsensusService();
const systemConfigService = new SystemConfigService();

const { check, string, boolean } = require('./api/common/typeCheck');
const channelPromise = require('./api/common/channelPromise');
const web3Sync = require('./api/common/web3lib/web3sync');
const isArray = require('isarray');
const ServiceBase = require('./api/common/serviceBase').ServiceBase;
const { produceSubCommandInfo, FLAGS, getAbi } = require('./cli/interfaces/base');
//deploy

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
})
app.post('/deploy',function(req, res){
    let data = req.body;
    let content = {};
    for(let i in data)
    {
        content = i;
    }
    content = JSON.parse(content);
    console.info('content', content.contractName)
    let contractName = content.contractName;
        contractName += '.sol';
       
        let contractPath = path.join(ContractsDir, contractName);
        // res.send(contractPath)
        if (!fs.existsSync(contractPath)) {
            throw new Error(`${contractName} doesn't exist`);
        }
        let outputDir = ContractsOutputDir;

        web3.deploy(contractPath, outputDir).then(result => {
            let contractAddress = result.contractAddress;
            if (result.status === '0x0') {
                let addressPath = path.join(outputDir, `.${path.basename(contractName, '.sol')}.address`);

                try {
                    fs.appendFileSync(addressPath, contractAddress + '\n');
                } catch (error) { }
            }
            res.send({ contractAddress: contractAddress, status: result.status })
        });
})

app.post('/addCompany',function(req,res){
    let data = req.body;
    let content = {};
    for(let i in data)
    {
        content = i;
    }
    content = JSON.parse(content);
    console.info('content', content)

    // res.send(content)
    let contractName = content.contract;
    let contractAddress = content.addr;
    let functionName = content.func;
    let parameters = [];

    parameters.push(content.address)
    parameters.push(content.name)
    parameters.push(parseInt(content.cash))


    
    console.info('22',contractName,contractAddress,functionName,parameters)
    let abi = getAbi(contractName);

    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                        // return ret;
                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }
                    // return ret;
                    res.send(ret)
                });
            }
        }
    }
})

app.post('/getCompany',function(req,res){
    let data = req.body;
    let content = {};
    for(let i in data)
    {
        content = i;
    }
    content = JSON.parse(content);
    console.info('content', content)
    let contractName = content.contract;
    let contractAddress = content.addr;
    let functionName = content.func;
    let parameters = [];
    parameters.push(content.address)

    console.info('22',contractName,contractAddress,functionName,parameters)
    let abi = getAbi(contractName);

    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }

                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }

                    res.send(ret)
                });
            }
        }
    }
})

app.post('/transaction',function(req,res){
    let data = req.body;
    let content = {};
    for(let i in data)
    {
        content = i;
    }
    content = JSON.parse(content);
    console.info('content', content)

    let contractName = content.contract;
    let contractAddress = content.addr;
    let functionName = content.func;
    let parameters = [];

    // parameters.push(parseInt(content.cash))
    parameters.push(content.to)
    parameters.push(content.fromAddr)
    parameters.push(parseInt(content.account))
    parameters.push(parseInt(content.status1))
    parameters.push(parseInt(content.payTime))

    console.info('22',contractName,contractAddress,functionName,parameters)
    let abi = getAbi(contractName);

    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }

                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }

                    res.send(ret)
                });
            }
        }
    }
})

app.post('/transfer',function(req,res){
    let data = req.body;
    let content = {};
    for(let i in data)
    {
        content = i;
    }
    content = JSON.parse(content);
    console.info('content', content)

    let contractName = content.contract;
    let contractAddress = content.addr;
    let functionName = content.func;
    let parameters = [];

    // parameters.push(parseInt(content.cash))
    parameters.push(content.toOld)
    parameters.push(content.toNew)
    parameters.push(content.fromAddr)
    parameters.push(parseInt(content.account))

    console.info('22',contractName,contractAddress,functionName,parameters)
    let abi = getAbi(contractName);

    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }

                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }

                    res.send(ret)
                });
            }
        }
    }
})

app.post('/saleReceipt',function(req,res){
    let data = req.body;
    let content = {};
    for(let i in data)
    {
        content = i;
    }
    content = JSON.parse(content);
    console.info('content', content)

    let contractName = content.contract;
    let contractAddress = content.addr;
    let functionName = content.func;
    let parameters = [];

    // parameters.push(parseInt(content.cash))
    parameters.push(content.A)
    parameters.push(parseInt(content.account))


    console.info('22',contractName,contractAddress,functionName,parameters)
    let abi = getAbi(contractName);

    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }

                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }

                    res.send(ret)
                });
            }
        }
    }
})

app.post('/repayment',function(req,res){
    let data = req.body;
    let content = {};
    for(let i in data)
    {
        content = i;
    }
    content = JSON.parse(content);
    console.info('content', content)

    let contractName = content.contract;
    let contractAddress = content.addr;
    let functionName = content.func;
    let parameters = [];

    // parameters.push(parseInt(content.cash))
    parameters.push(content.checkAddr)


    console.info('22',contractName,contractAddress,functionName,parameters)
    let abi = getAbi(contractName);

    if (!abi) {
        throw new Error(`no abi file for contract ${contractName}`);
    }

    for (let item of abi) {
        if (item.name === functionName && item.type === 'function') {
            if (item.inputs.length !== parameters.length) {
                throw new Error(`wrong number of parameters for function \`${item.name}\`, expected ${item.inputs.length} but got ${parameters.length}`);
            }

            functionName = utils.spliceFunctionSignature(item);

            if (item.constant) {
                return web3.call(contractAddress, functionName, parameters).then(result => {
                    let status = result.result.status;
                    let ret = {
                        status: status
                    };
                    let output = result.result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }

                    res.send(ret)
                });
            } else {
                return web3.sendRawTransaction(contractAddress, functionName, parameters).then(result => {
                    let txHash = result.transactionHash;
                    let status = result.status;
                    let ret = {
                        transactionHash: txHash,
                        status: status
                    };
                    let output = result.output;
                    if (output !== '0x') {
                        ret.output = utils.decodeMethod(item, output);
                    }

                    res.send(ret)
                });
            }
        }
    }
})

app.get('/',function(req,res){
    res.send('这里是根目录') ;
    console.log('main page is required ');
}) ;



// 监听3000端口
console.info('listen 3000')
var server=app.listen(3000);