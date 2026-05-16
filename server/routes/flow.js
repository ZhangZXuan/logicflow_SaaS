const express = require('express')
const router = express.Router()
const c = require('../controller/flowController')

//管理员保存流程模板
router.post('/saveTemplate', c.saveTemplate)
//员工发起审批
router.post('/createInstance', c.createInstance)
//员工查看审批单
router.get('/getInstance', c.getInstance)
//员工提交审批
router.post('/handleSubmit', c.handleSubmit)
//根据ID获取事件信息
router.get('/getInfo', c.idGetInfo)
//根据ID获取下一个连续的student节点
router.get('/getNextContinuousStudentNode', c.getNextContinuousStudentNode)
//管理员获取所有流程模板
router.get('/getAllTemplates', c.getAllTemplates)
//根据userId获取我的申请
router.get('/getMyApply', c.getMyApply)
//获取待审批列表
router.get('/getPendingList', c.getPendingList)
//审批通过
router.post('/approvePass', c.approvePass)
//审批驳回
router.post('/approveReject', c.approveReject)
//获取审批指标数据
router.get('/getMetricsData', c.getMetricsData)
module.exports = router