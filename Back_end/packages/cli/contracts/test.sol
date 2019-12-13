pragma solidity ^0.4.21;

contract test{
	address public agencyAddr;
	
	struct Company{ //在第三方处注册的公司才能进行有效的债权转让
		address companyAddr;
		string companyName;
		uint canTrust; // 由Agency判断公司是否可信
		uint receipt_count;  //由于账款长度变化 以此记录长度 而非直接用.length
		uint cashAccount; //现金
	}
	struct Receipt{	//记录账款
		address to;
		address from1;
		uint amount;
		uint buildDate; //账款创建日期
		uint payDate;//日期限制 测试以秒为单位 便于快速观察
	}
	
	mapping(address => Receipt[]) public accountsReceivable;// 应收账款
	mapping(address => Company) public companys;
	bool status; //查看合约调用时的状态  false表示处理失败
	Receipt temp_receipt; //临时变量
	uint[] index;//A 可能存到从B多个不同期限的贷款 而进行债券转化时可以大于其中一个贷款 因此可能有多个债权需要更改
	
	constructor(){
		agencyAddr = msg.sender;
		companys[agencyAddr] = Company({
			companyAddr: agencyAddr,
			companyName: "Agency",
			canTrust: 1,
			receipt_count: 0,
			cashAccount: 100000 //足够大
		});
	}
	
	function addCompany(address addr, string name, uint cash) public returns (address){
		
		require(msg.sender == agencyAddr); //Only the agency can register a new company
		uint trust = 0;
		if(cash >= 100){
			trust = cash/100; //当公司注册资产大于1000时，认为该公司可信
		}
		companys[addr] = Company({
			companyAddr: addr,
			companyName: name,
			canTrust: trust,
			receipt_count: 0,
			cashAccount: cash
		});
		return msg.sender;
	}

	function getCompany(address addr)
		public
		returns (address, string, uint, uint,uint)
	{
		return (companys[addr].companyAddr,companys[addr].companyName, companys[addr].canTrust, companys[addr].receipt_count,companys[addr].cashAccount);
	}
	
	function transfer(address toOld, address toNew, address fromAddr, uint account) public { //债权转移 并处理转移后的变量
		status = false;
		//require(msg.sender == toOld); //不能校验这个 因为repayment函数调用到transfer此时msg.sender为toNew
		require(toNew != fromAddr);//"obligor can not be the same as creditor"
		
		//处理 to
		delete(index);
		uint curAccount = 0;
		for(uint i = 0; i < companys[toOld].receipt_count; i++){
			if(accountsReceivable[toOld][i].from1 == fromAddr){
				curAccount += accountsReceivable[toOld][i].amount;
				index.push(i);// 记录下转让方需要处理的特定债权下标
				if(curAccount >= account){
					break;
				}
			}
		}
		require(curAccount >= account); //债权总额不足 "There are no enough account to transfer"
		require(index.length > 0);
		uint tmpLength = companys[toOld].receipt_count;
		if(curAccount > account){//部分债权转移需要考虑怎么转 避免覆盖
			Receipt creTmp = accountsReceivable[toOld][index[0]];
			accountsReceivable[toOld][index[0]] = accountsReceivable[toOld][index[index.length - 1]];
			accountsReceivable[toOld][index[index.length - 1]] = creTmp; //调转
			for(i = index.length - 1; i >= 1; i--){ //后length - 1个是整个债券转让  第1个是部分债权转让
				temp_receipt = accountsReceivable[toOld][index[i]];
				addReceipt(toNew);
				accountsReceivable[toOld][index[i]] = accountsReceivable[toOld][tmpLength + i - index.length];
				if(i == 0 || i >= index.length){
					break;
				}
			}
			companys[toOld].receipt_count = companys[toOld].receipt_count - index.length + 1;
			temp_receipt = accountsReceivable[toOld][index[0]];
			temp_receipt.amount = temp_receipt.amount - (curAccount - account); // 总的-剩余的=转移的
			accountsReceivable[toOld][index[0]].amount = curAccount - account; //剩余的债权curAccount - account
			addReceipt(toNew);
		}else{
			for(i = index.length - 1; i >= 0; i--){ //从后往前避免出错
				temp_receipt = accountsReceivable[toOld][index[i]];
				addReceipt(toNew);
				accountsReceivable[toOld][index[i]] = accountsReceivable[toOld][tmpLength + i - index.length];
				if(i == 0 || i >= index.length){
					break;
				}
			}
			companys[toOld].receipt_count -= index.length;
		}
		status = true;
	}
	
	function addReceipt(address addr) internal{ //增加债权 反正都是债主 没必要检查地址
		temp_receipt.to = addr; //处理方便一些
		if(companys[addr].receipt_count < accountsReceivable[addr].length){ 
			accountsReceivable[addr][companys[addr].receipt_count] = temp_receipt;
		}else{
			accountsReceivable[addr].push(temp_receipt);
		}
		companys[addr].receipt_count += 1;
	}
	
	
	function saleReceipt(address A,uint account) public{ // 卖出债权到金融机构
		status = false;
		address checkAddr = A;
		delete(index);
		uint surplus;
		for(uint j = 0; j < companys[checkAddr].receipt_count; j++){ //temp_receipt.from1是还款人  
			surplus += accountsReceivable[checkAddr][j].amount; //记录还款人需要进行其名下的债权转让的债款下标
			index.push(j);
			if(surplus >= account){
				break;
			}
		}
		require(surplus >= account);
		if(surplus == account){
			for(uint i = 0; i < index.length; i++){
				transfer(checkAddr, agencyAddr, accountsReceivable[checkAddr][j].from1, accountsReceivable[checkAddr][j].amount);
			}
		}else{
			for(i = 0; i < index.length - 1; i++){
				transfer(checkAddr, agencyAddr, accountsReceivable[checkAddr][j].from1, accountsReceivable[checkAddr][j].amount);
			}
			transfer(checkAddr, agencyAddr, accountsReceivable[checkAddr][index.length - 1].from1, accountsReceivable[checkAddr][index.length - 1].amount - (surplus - account));
		}
		companys[checkAddr].cashAccount += account;
		status = true;
	}
	
	
	function transaction(address to, address fromAddr, uint account, bool status1, uint payTime) public { //从from1向to发起交易 status为true直接用现金支付 为false发起贷款
		status = false;
		//require(msg.sender == fromAddr);
		require(to != agencyAddr); //金融机构不购买货物 只购买债权
		if(status1 == true){
			require(companys[to].cashAccount >= account);
			companys[fromAddr].cashAccount += account;
			companys[to].cashAccount -= account;
		}else{ 
			require(companys[fromAddr].canTrust >= 1);//此时需要from1地址公司的canTrust为true 才能贷款
			temp_receipt = Receipt({
				to: to,
				from1: fromAddr,
				amount: account,
				buildDate: now,
				payDate: payTime
			});
			addReceipt(to);
		}
		status = true; //交易建立成功
	}
	
	function repayment(address checkAddr) public{ //检查checkAddr(便于Agency去调用)对应公司的应收账款是否到期 到期则负责收回
		status = false;
		for(uint i = companys[checkAddr].receipt_count - 1; i >= 0 ; i--){ //新添加的债权都在后 因此不影响
			temp_receipt = accountsReceivable[checkAddr][i];
			if(now >= temp_receipt.buildDate + temp_receipt.payDate * 1){ //到了还款日期
				if(companys[temp_receipt.from1].cashAccount >= temp_receipt.amount){
					companys[temp_receipt.from1].cashAccount -= temp_receipt.amount; //用现金还款
					companys[temp_receipt.to].cashAccount += temp_receipt.amount;
				}else{//现金+债权还款
					//先判断是否有足够的债权进行转移
					uint surplus = companys[temp_receipt.from1].cashAccount;
					delete(index);
					for(uint j = 0; j < companys[temp_receipt.from1].receipt_count; j++){ //credit.from1是还款人  
						surplus += accountsReceivable[temp_receipt.from1][j].amount; //记录还款人需要进行其名下的债权转让的债款下标
						index.push(j);
						if(surplus >= temp_receipt.amount){
							break;
						}
					}
					require(surplus >= temp_receipt.amount); //还款失败
					companys[temp_receipt.from1].cashAccount = 0;
					if(surplus > temp_receipt.amount){
						for(j = 0; j < index.length - 1; j++){ //不区分fromAddr来转让债权
							transfer(temp_receipt.from1, checkAddr, accountsReceivable[temp_receipt.from1][j].from1, accountsReceivable[temp_receipt.from1][j].amount); //全部转让
						}
						transfer(temp_receipt.from1, checkAddr, accountsReceivable[temp_receipt.from1][index.length - 1].from1, accountsReceivable[temp_receipt.from1][index.length - 1].amount - (surplus - temp_receipt.amount));//转让部分
					}else{
						for(j = 0; j < index.length; j++){ //不区分fromAddr来转让债权
							transfer(temp_receipt.from1, checkAddr, accountsReceivable[temp_receipt.from1][j].from1, accountsReceivable[temp_receipt.from1][j].amount); //全部转让
						}
					}
				}
				accountsReceivable[checkAddr][i] = accountsReceivable[checkAddr][companys[checkAddr].receipt_count - 1];//transfer
				companys[checkAddr].receipt_count -= 1; //去除账单 
			}
			if(i == 0){
				break;
			}
		}
		status = true;
	}
}


	