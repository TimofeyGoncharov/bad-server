import { NextFunction, Request, Response, Router } from 'express'
import NotFoundError from '../errors/not-found-error'
import auth, { roleGuardMiddleware } from '../middlewares/auth'
import { csrfProtection } from '../middlewares/CSRTFProtection'
import { Role } from '../models/user'
import authRouter from './auth'
import customerRouter from './customers'
import orderRouter from './order'
import productRouter from './product'
import uploadRouter from './upload'

const router = Router()

router.use('/auth', authRouter)
router.use('/product', csrfProtection, productRouter)
router.use('/order', auth, orderRouter)
router.use('/upload', auth, uploadRouter)
router.use(
    '/customers',
    csrfProtection,
    auth,
    roleGuardMiddleware(Role.Admin),
    customerRouter
)

router.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError('Маршрут не найден'))
})

export default router