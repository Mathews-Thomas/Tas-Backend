import express from 'express'
import adminRouter from './admin/adminRouter.js';
import employeeRouter from './reception/employeeRouter.js';
import BranchRouter from './branch/branch.js';

const router = express.Router();
router.use('/admin',adminRouter)
router.use('/',employeeRouter)
router.use('/branch',BranchRouter)

const rootRouter = router
export default rootRouter; 