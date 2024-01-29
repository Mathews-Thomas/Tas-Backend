import express from 'express'
import adminRouter from './admin/adminRouter.js';
import receptionRouter from './reception/receptionRouter.js';
import BranchRouter from './branch/branch.js';

const router = express.Router();
router.use('/admin',adminRouter)
router.use('/',receptionRouter)
router.use('/branch',BranchRouter)

const rootRouter = router
export default rootRouter;