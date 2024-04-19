import express from 'express'
import adminRouter from './admin/adminRouter.js';
import receptionRouter from './reception/receptionRouter.js'; 

const router = express.Router();

router.use('/admin',adminRouter)
router.use('/',receptionRouter) 

const rootRouter = router
export default rootRouter;