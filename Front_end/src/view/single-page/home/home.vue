<template>
  <div>
    <Card>
      <h1>区块链借贷平台</h1>
    </Card>
    <Card>
      <h2>合约内容</h2>
      <Row style = "margin: 10px 0">
        <Col span="4" style="text-align: right"><span>调用合约名：</span>
        </Col>
        <Col span="8">{{ this.showData[this.nowIndex].name }}</Col>
      </Row>
      <Row style = "margin: 10px 0">
        <Col span="4" style="text-align: right"><span>调用合约地址：</span>
        </Col>
        <Col span="8">{{ this.showData[this.nowIndex].contractAddress }}</Col>
      </Row>
    </Card>
    <Card>
      <h2>合约部署</h2>
      <Row style = "margin: 10px 0">
        <Col span="5" offset = "3">
          <Button type="default" style="width: 100px; font-size: 11px; margin-right: 10px" @click="openAdd">调用合约</Button>
        </Col>
      </Row>
    </Card>
    <Card>
      <h2>合约函数</h2>
      <Row style = "margin: 10px 0">
        <Col span="20" offset = "3">
          <Button type="default" style="width: 150px; font-size: 11px; margin-right: 10px" @click="openCreate">添加新公司</Button>
          <Button type="default" style="width: 150px; font-size: 11px; margin-right: 10px" @click="openTransaction">向其他公司借款</Button>
          <Button type="default" style="width: 150px; font-size: 11px; margin-right: 10px" @click="openTransfer">转移债权</Button>
          <Button type="default" style="width: 150px; font-size: 11px; margin-right: 10px" @click="openSaleReceipt">向银行抵押债券</Button>
          <Button type="default" style="width: 150px; font-size: 11px; margin-right: 10px" @click="openRepayment">发起清算</Button>
        </Col>
      </Row>
    </Card>
    <Card>
      <h2>查询操作</h2>
      <Row style = "margin: 10px 0">
        <Col span="5" offset = "1">
          <Button type="default" style="width: 100px; font-size: 11px; margin-right: 10px" @click="openGetCompany">查询公司</Button>
        </Col>
      </Row>
      <Col style = "margin: 10px 0">
        <Row span="3" style="text-align: left"><span>公司地址：</span></Row>
        <Row span="2">{{ this.companyInfo[0] }}</Row>
        <Row span="3" style="text-align: left"><span>公司名称：</span></Row>
        <Row span="2">{{ this.companyInfo[1] }}</Row>
        <Row span="3" style="text-align: left"><span>公司信用等级：</span></Row>
        <Row span="2">{{ this.companyInfo[2] }}</Row>
        <Row span="3" style="text-align: left"><span>公司债权数：</span></Row>
        <Row span="2">{{ this.companyInfo[3] }}</Row>
        <Row span="3" style="text-align: left"><span>公司资金：</span></Row>
        <Row span="2">{{ this.companyInfo[4] }}</Row>
      </Col>
    </Card>

  <Modal v-model="createCompany" title="添加公司">
    <Form :model="addForm" ref="addForm" :label-width="110">
      <FormItem label="公司地址" prop="address" >
        <Input clearable v-model="addForm.address" placeholder = "请输入公司地址"/>
      </FormItem>
      <FormItem label="公司名称" prop="name" >
        <Input clearable v-model="addForm.name" placeholder = "请输入公司名称"/>
      </FormItem>
      <FormItem label="公司资产" prop="cash" >
        <Input clearable v-model="addForm.cash" placeholder = "请输入公司资产"/>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" @click="cancelAdd">取消</Button>
      <Button type="default" @click="doAdd">确认</Button>
    </div>
  </Modal>

  <Modal v-model="isGetCompany" title="查询公司">
    <Form :model="addForm" ref="addForm" :label-width="110">
      <FormItem label="公司地址" prop="address" >
        <Input  clearable v-model="addForm.address" placeholder = "请输入公司地址"/>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" @click="cancelAdd">取消</Button>
      <Button type="default" @click="doAdd">确认</Button>
    </div>
  </Modal>

  <Modal v-model="isTransaction" title="借款">
    <Form :model="addForm" ref="addForm" :label-width="110">
      <FormItem label="债主公司" prop="to" >
        <Input  clearable v-model="addForm.to" placeholder = "请输入债主公司地址"/>
      </FormItem>
      <FormItem label="借款公司" prop="fromAddr" >
        <Input  clearable v-model="addForm.fromAddr" placeholder = "请输入借款公司地址"/>
      </FormItem>
      <FormItem label="借款数" prop="account" >
        <Input  clearable v-model="addForm.account" placeholder = "请输入借款数"/>
      </FormItem>
      <FormItem label="还款时间" prop="payTime" >
        <Input  clearable v-model="addForm.payTime" placeholder = "请输入还款时间"/>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" @click="cancelAdd">取消</Button>
      <Button type="default" @click="doAdd">确认</Button>
    </div>
  </Modal>

  <Modal v-model="isTransfer" title="转移债权">
    <Form :model="addForm" ref="addForm" :label-width="110">
      <FormItem label="原债主公司" prop="toOld" >
        <Input  clearable v-model="addForm.toOld" placeholder = "请输入原债主公司地址"/>
      </FormItem>
      <FormItem label="新债主公司" prop="toNew" >
        <Input  clearable v-model="addForm.toNew" placeholder = "请输入新债主公司地址"/>
      </FormItem>
      <FormItem label="借款公司" prop="fromAddr" >
        <Input  clearable v-model="addForm.fromAddr" placeholder = "请输入借款公司地址"/>
      </FormItem>
      <FormItem label="转移债权数" prop="account" >
        <Input  clearable v-model="addForm.account" placeholder = "请输入转移债权数"/>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" @click="cancelAdd">取消</Button>
      <Button type="default" @click="doAdd">确认</Button>
    </div>
  </Modal>

  <Modal v-model="isSaleReceipt" title="抵押债券">
    <Form :model="addForm" ref="addForm" :label-width="110">
      <FormItem label="抵押债券公司" prop="A" >
        <Input  clearable v-model="addForm.A" placeholder = "请输入抵押债券公司地址"/>
      </FormItem>
      <FormItem label="抵押债券数" prop="account" >
        <Input  clearable v-model="addForm.account" placeholder = "请输入抵押债券数"/>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" @click="cancelAdd">取消</Button>
      <Button type="default" @click="doAdd">确认</Button>
    </div>
  </Modal>

  <Modal v-model="isRepayment" title="清算">
    <Form :model="addForm" ref="addForm" :label-width="110">
      <FormItem label="发起清算公司" prop="checkAddr" >
        <Input  clearable v-model="addForm.checkAddr" placeholder = "请输入发起清算公司地址"/>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" @click="cancelAdd">取消</Button>
      <Button type="default" @click="doAdd">确认</Button>
    </div>
  </Modal>

  </div>
</template>

<script>
import axios from '@/libs/api.request'
export default {
  data () {
    return {
      showData: [{
        name: '',
        contractAddress: ''
      }],
      nowIndex: 0,
      createCompany: false,
      addForm: {},
      isGetCompany: false,
      isTransaction: false,
      isTransfer: false,
      isSaleReceipt: false,
      isRepayment: false,
      companyInfo: {},
      receiptInfo: {}
    }
    },
    methods:{
      async deploy(param) {
      let self = this
      let result = {}
      let da = {
        contractName: param,
      }
    
      await axios.request({
          url: "deploy",
          data: da,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data
          self.showData.push({name: param,contractAddress: result.contractAddress});
      });
      },
      async addCompany(param) {
      let self = this
      let result = {}
      let judge = ""
      await axios.request({
          url: "addCompany",
          data: param,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: "post"
      }).then(function(res) {
          result = res.data
      });
      },
      async getCompany(param) {
      let self = this
      let result = {}
      let judge = ""
      await axios.request({
          url: "getCompany",
          data: param,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data.output
          judge = res.data.status
      });
      if(judge == "0x0")
      {
        this.companyInfo = result;
        this.companyInfo[4] = parseInt(result[4],16);
        this.companyInfo[2] = parseInt(result[2],16);
        console.info(this.companyInfo[4])
      }
      else
      {
        this.companyInfo = {0:"无",1:"无",2:"0",3:"0"}
      }
      },
      async transaction(param) {
      let self = this
      let result = {}
      await axios.request({
          url: "transaction",
          data: param,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data
      });
      },
      async transfer(param) {
      let self = this
      let result = {}
      await axios.request({
          url: "transfer",
          data: param,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data
      });
      },
      async saleReceipt(param) {
      let self = this
      let result = {}
      await axios.request({
          url: "saleReceipt",
          data: param,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data
      });
      },
      async repayment(param) {
      let self = this
      let result = {}
      await axios.request({
          url: "repayment",
          data: param,
          headers:{
            'Content-type': 'application/x-www-form-urlencoded',
          },
          method: "post"
      }).then(function(res) {
          console.info(res.data);
          result = res.data
      });
      },
      openAdd(){
        this.deploy('test');
        this.nowIndex += 1;
      },
      openCreate(){
        this.createCompany = true;
        this.addForm.func = 'addCompany';
        this.addForm.addr = this.showData[this.nowIndex].contractAddress;
        this.addForm.contract = this.showData[this.nowIndex].name;
        this.addForm.name = '';
        this.addForm.address = '';
        this.addForm.cash = '';
        console.info(this.addForm)
      },
      openGetCompany(){
        this.isGetCompany = true;
        this.addForm.func = 'getCompany';
        this.addForm.addr = this.showData[this.nowIndex].contractAddress;
        this.addForm.contract = this.showData[this.nowIndex].name;
        this.addForm.address = '';
      },
      openTransaction(){
        this.isTransaction = true;
        this.addForm.func = 'transaction';
        this.addForm.addr = this.showData[this.nowIndex].contractAddress;
        this.addForm.contract = this.showData[this.nowIndex].name;
        this.addForm.to = '';
        this.addForm.fromAddr = '';
        this.addForm.account = '';
        this.addForm.payTime = '';
      },
      openTransfer(){
        this.isTransfer = true;
        this.addForm.func = 'transfer';
        this.addForm.addr = this.showData[this.nowIndex].contractAddress;
        this.addForm.contract = this.showData[this.nowIndex].name;
        this.addForm.toOld = '';
        this.addForm.toNew = '';
        this.addForm.fromAddr = '';
        this.addForm.account = '';
      },
      openSaleReceipt(){
        this.isSaleReceipt = true;
        this.addForm.func = 'saleReceipt';
        this.addForm.addr = this.showData[this.nowIndex].contractAddress;
        this.addForm.contract = this.showData[this.nowIndex].name;
        this.addForm.A = '';
        this.addForm.account = '';
      },
      openRepayment(){
        this.isRepayment = true;
        this.addForm.func = 'repayment';
        this.addForm.addr = this.showData[this.nowIndex].contractAddress;
        this.addForm.contract = this.showData[this.nowIndex].name;
        this.addForm.checkAddr = '';
      },
      cancelAdd(){
        this.$refs.addForm.resetFields();
        this.addForm = {}
        this.createCompany = false
        this.isGetCompany = false
        this.isTransaction = false
        this.isTransfer = false
        this.isSaleReceipt = false
        this.isRepayment = false
        this.isGetReceipt = false
      },
      doAdd(){
        console.info(this.addForm)
        if(this.addForm.func == 'addCompany')
        {
          let data = {};
          data.func = this.addForm.func
          data.addr = this.addForm.addr
          data.contract = this.addForm.contract
          data.name = this.addForm.name
          data.address = this.addForm.address
          data.cash = this.addForm.cash
          this.addCompany(data)
          this.$Message.success('添加公司成功')
        }
        else if(this.addForm.func == 'getCompany')
        {
          let data = {};
          data.func = this.addForm.func
          data.addr = this.addForm.addr
          data.contract = this.addForm.contract
          data.address = this.addForm.address
          console.info(data)
          this.getCompany(data)
          this.$Message.success('查询公司成功')
        }
        else if(this.addForm.func == 'transaction')
        {
          let data = {};
          data.func = this.addForm.func
          data.addr = this.addForm.addr
          data.contract = this.addForm.contract
          data.to = this.addForm.to
          data.fromAddr = this.addForm.fromAddr
          data.account = this.addForm.account
          data.status1 = 0
          data.payTime = this.addForm.payTime
          console.info(data)
          this.transaction(data)
          this.$Message.success('生成账单成功')
        }
        else if(this.addForm.func == 'transfer')
        {
          let data = {};
          data.func = this.addForm.func
          data.addr = this.addForm.addr
          data.contract = this.addForm.contract
          data.toOld = this.addForm.toOld
          data.toNew = this.addForm.toNew
          data.fromAddr = this.addForm.fromAddr
          data.account = this.addForm.account
          console.info(data)
          this.transfer(data)
          this.$Message.success('转移账单公司成功')
        }
        else if(this.addForm.func == 'saleReceipt')
        {
          let data = {};
          data.func = this.addForm.func
          data.addr = this.addForm.addr
          data.contract = this.addForm.contract
          data.A = this.addForm.A
          data.account = this.addForm.account
          this.saleReceipt(data)
          this.$Message.success('出售账单公司成功')
        }
        else if(this.addForm.func == 'repayment')
        {
          let data = {};
          data.func = this.addForm.func
          data.addr = this.addForm.addr
          data.contract = this.addForm.contract
          data.checkAddr = this.addForm.checkAddr
          this.repayment(data)
          this.$Message.success('结清账单公司成功')
        }
        this.cancelAdd();
      },
    },
    created () {
      this.nowIndex = 0;
    }
}
</script>

<style>
  span{
    font-weight:bold;
    font-size:25;
  }
</style>
