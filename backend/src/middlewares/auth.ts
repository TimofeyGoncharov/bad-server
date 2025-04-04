import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { Model, Types } from 'mongoose'
import { ACCESS_TOKEN } from '../config'
import ForbiddenError from '../errors/forbidden-error'
import NotFoundError from '../errors/not-found-error'
import UnauthorizedError from '../errors/unauthorized-error'
import UserModel, { Role } from '../models/user'

// есть файл middlewares/auth.js, в нём мидлвэр для проверки JWT;

const auth = async (req: Request, res: Response, next: NextFunction) => {
    let payload: JwtPayload | null = null
    const authHeader = req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedError('Tокен невалидный')
    }
    try {
        const accessTokenParts = authHeader.split(' ')
        const aTkn = accessTokenParts[1]
        payload = jwt.verify(aTkn, ACCESS_TOKEN.secret) as JwtPayload

        const user = await UserModel.findOne(
            {
                _id: new Types.ObjectId(payload._id),
            },
            { password: 0, salt: 0 }
        )

        if (!user) {
            return next(new ForbiddenError('ForbiddenError'))
        }
        res.locals.user = user

        return next()
    } catch (error) {
        if (error instanceof Error && error.name === 'TokenExpiredError') {
            return next(new UnauthorizedError('UnauthorizedError'))
        }
        return next(new UnauthorizedError('UnauthorizedError'))
    }
}

export function roleGuardMiddleware(...roles: Role[]) {
    return (_req: Request, res: Response, next: NextFunction) => {
        if (!res.locals.user) {
            return next(new UnauthorizedError('UnauthorizedError'))
        }

        const hasAccess = roles.some((role) =>
            res.locals.user.roles.includes(role)
        )

        if (!hasAccess) {
            return next(new ForbiddenError('Доступ запрещен'))
        }

        return next()
    }
}

export function currentUserAccessMiddleware<T>(
    model: Model<T>,
    idProperty: string,
    userProperty: keyof T
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const id = req.params[idProperty]

        if (!res.locals.user) {
            return next(new UnauthorizedError('UnauthorizedError'))
        }

        if (res.locals.user.roles.includes(Role.Admin)) {
            return next()
        }

        const entity = await model.findById(id)

        if (!entity) {
            return next(new NotFoundError('NotFoundError'))
        }

        const userEntityId = entity[userProperty] as Types.ObjectId
        const hasAccess = new Types.ObjectId(res.locals.user.id).equals(
            userEntityId
        )

        if (!hasAccess) {
            return next(new ForbiddenError('ForbiddenError'))
        }

        return next()
    }
}

export default auth